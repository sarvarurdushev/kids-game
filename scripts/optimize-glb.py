#!/usr/bin/env python3
"""Recompress a glTF-binary's embedded PBR textures and repack the buffer.

Tripo3D (and similar AI 3D generators) export base color / normal /
metallic-roughness maps at 2K-4K resolution as loosely-compressed PNG/JPEG,
which is far more than a character rendered at a few hundred pixels on a
phone screen needs — an 8-9MB .glb is a real load-time problem for a
browser game. This resizes each texture role down to a size fit for that
render scale and re-packs the binary buffer (bufferViews only move;
geometry data is untouched).

Usage: python3 scripts/optimize-glb.py input.glb output.glb
"""

import struct
import json
import io
import sys
from PIL import Image

# (max dimension, output format, JPEG quality or None for PNG, drop alpha)
ROLE_SPECS = {
    "baseColorTexture": (1024, "JPEG", 85, False),
    "normalTexture": (1024, "JPEG", 90, False),
    "metallicRoughnessTexture": (512, "PNG", None, True),
    "occlusionTexture": (512, "PNG", None, True),
    "emissiveTexture": (512, "JPEG", 85, False),
}
DEFAULT_SPEC = (1024, "JPEG", 85, False)


def align4(n):
    return (n + 3) & ~3


def load_glb(path):
    with open(path, "rb") as f:
        data = f.read()
    _, _, _ = struct.unpack("<4sII", data[0:12])
    chunk_len, _ = struct.unpack("<II", data[12:20])
    gltf = json.loads(data[20 : 20 + chunk_len])
    offset = 20 + chunk_len
    bin_len, _ = struct.unpack("<II", data[offset : offset + 8])
    bin_data = data[offset + 8 : offset + 8 + bin_len]
    return gltf, bin_data


def texture_roles_by_image_index(gltf):
    """Map image index -> texture role name, by walking every material's
    texture references. Falls back to DEFAULT_SPEC for anything unmapped
    (e.g. multiple materials reusing a role name inconsistently)."""
    roles = {}
    textures = gltf.get("textures", [])
    for material in gltf.get("materials", []):
        pbr = material.get("pbrMetallicRoughness", {})
        refs = {
            "baseColorTexture": pbr.get("baseColorTexture"),
            "metallicRoughnessTexture": pbr.get("metallicRoughnessTexture"),
            "normalTexture": material.get("normalTexture"),
            "occlusionTexture": material.get("occlusionTexture"),
            "emissiveTexture": material.get("emissiveTexture"),
        }
        for role, ref in refs.items():
            if not ref:
                continue
            tex = textures[ref["index"]]
            image_index = tex["source"]
            roles[image_index] = role
    return roles


def optimize(in_path, out_path):
    gltf, bin_data = load_glb(in_path)
    bvs = gltf["bufferViews"]
    images = gltf.get("images", [])
    roles = texture_roles_by_image_index(gltf)

    new_image_bytes = {}
    for i, img in enumerate(images):
        bv = bvs[img["bufferView"]]
        raw = bin_data[bv["byteOffset"] : bv["byteOffset"] + bv["byteLength"]]
        im = Image.open(io.BytesIO(raw))
        max_size, fmt, quality, drop_alpha = ROLE_SPECS.get(roles.get(i), DEFAULT_SPEC)
        im.thumbnail((max_size, max_size), Image.LANCZOS)
        if drop_alpha and im.mode == "RGBA":
            im = im.convert("RGB")
        elif fmt == "JPEG" and im.mode != "RGB":
            im = im.convert("RGB")
        buf = io.BytesIO()
        if fmt == "JPEG":
            im.save(buf, format="JPEG", quality=quality, optimize=True)
        else:
            im.save(buf, format="PNG", optimize=True)
        new_bytes = buf.getvalue()
        new_image_bytes[i] = new_bytes
        img["mimeType"] = "image/jpeg" if fmt == "JPEG" else "image/png"
        print(f"image {i} ({roles.get(i, 'unknown role')}): {len(raw)} -> {len(new_bytes)} bytes, {im.size}")

    image_bv_indices = set(img["bufferView"] for img in images)

    new_buffer_parts = []
    new_offsets = {}
    cursor = 0

    for i in sorted(image_bv_indices):
        chunk = new_image_bytes[i]
        pad = align4(len(chunk)) - len(chunk)
        new_offsets[i] = (cursor, len(chunk))
        new_buffer_parts.append(chunk + b"\x00" * pad)
        cursor += len(chunk) + pad

    for idx, bv in enumerate(bvs):
        if idx in image_bv_indices:
            continue
        old_off, old_len = bv["byteOffset"], bv["byteLength"]
        chunk = bin_data[old_off : old_off + old_len]
        pad = align4(len(chunk)) - len(chunk)
        new_offsets[idx] = (cursor, len(chunk))
        new_buffer_parts.append(chunk + b"\x00" * pad)
        cursor += len(chunk) + pad

    new_bin = b"".join(new_buffer_parts)

    for idx, bv in enumerate(bvs):
        off, ln = new_offsets[idx]
        bv["byteOffset"] = off
        bv["byteLength"] = ln

    gltf["buffers"][0]["byteLength"] = len(new_bin)
    gltf["buffers"][0].pop("uri", None)

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * (align4(len(json_bytes)) - len(json_bytes))
    new_bin += b"\x00" * (align4(len(new_bin)) - len(new_bin))

    total_len = 12 + 8 + len(json_bytes) + 8 + len(new_bin)
    with open(out_path, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total_len))
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(new_bin), 0x004E4942))
        f.write(new_bin)

    print(f"wrote {out_path}: {total_len} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: python3 scripts/optimize-glb.py input.glb output.glb")
        sys.exit(1)
    optimize(sys.argv[1], sys.argv[2])
