import struct, zlib

def create_png(w, h):
    def chunk(t, d):
        c = t + d
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(d)) + c + crc
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    raw = b''
    cx, cy = w // 2, h // 2
    for y in range(h):
        raw += b'\x00'
        for x in range(w):
            dx, dy = x - cx, y - cy
            d = (dx * dx + dy * dy) ** 0.5
            if d < w * 0.38 and d > w * 0.08:
                right_side = x > cx + w * 0.05
                mid_bar_y = abs(dy) < h * 0.08
                mid_bar_left = x > cx - w * 0.15
                mid_bar_right = x < cx + w * 0.2
                bottom_mid = y > cy + h * 0.05
                if right_side or (mid_bar_y and mid_bar_left) or (mid_bar_y and mid_bar_right and bottom_mid):
                    raw += struct.pack('BBBB', 248, 220, 101, 255)
                else:
                    raw += struct.pack('BBBB', 23, 23, 20, 255)
            else:
                raw += struct.pack('BBBB', 23, 23, 20, 255)
    idat = chunk(b'IDAT', zlib.compress(raw))
    iend = chunk(b'IEND', b'')
    return sig + ihdr + idat + iend

with open('icons/icon-192.png', 'wb') as f:
    f.write(create_png(192, 192))
with open('icons/icon-512.png', 'wb') as f:
    f.write(create_png(512, 512))
print('Icons created successfully')