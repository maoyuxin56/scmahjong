from PIL import Image

im = Image.open(r"./o73MANMM3B.png")

pos_list = {
    "1b": "83px 64px 413px 541px",
    "2b": "526px 64px 413px 541px",
    "3b": "971px 64px 413px 541px",
    "4b": "1415px 64px 413px 541px",
    "5b": "1857px 64px 413px 541px",
    "6b": "83px 646px 413px 541px",
    "7b": "526px 646px 413px 541px",
    "8b": "971px 646px 413px 541px",
    "9b": "1415px 646px 413px 541px",

    "1t": "1421px 1934px 413px 541px",
    "2t": "971px 1302px 413px 541px",
    "3t": "1884px 1305px 413px 541px",
    "4t": "1421px 1305px 413px 541px",
    "5t": "76px 1925px 413px 541px",
    "6t": "526px 1925px 413px 541px",
    "7t": "980px 1934px 413px 541px",
    "8t": "526px 1302px 413px 541px",
    "9t": "83px 1302px 413px 541px",

    "1w": "78px 3217px 413px 541px",
    "2w": "518px 3217px 413px 541px",
    "3w": "959px 3217px 413px 541px",
    "4w": "1400px 3217px 413px 541px",
    "5w": "1841px 3217px 413px 541px",
    "6w": "78px 3801px 413px 541px",
    "7w": "518px 3801px 413px 541px",
    "8w": "959px 3801px 413px 541px",
    "9w": "1395px 3807px 413px 541px",
}

for name, pos in pos_list.items():
    pos = [int(x[:-2]) for x in pos.split(" ")]

    im1 = im.crop((pos[0], pos[1], pos[0]+pos[2], pos[1]+pos[3]))

    im1.save(name+".png")
