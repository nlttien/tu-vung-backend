import pykakasi

# Khởi tạo đối tượng Kakasi
kakasi = pykakasi.kakasi()


# Văn bản cần chuyển đổi
text = "第一条：ぐずぐずと始めるな時間厳守。/行動5分前には所定の場所で/仕事の準備と心の準備を/整えて待機せよ。"

# Chuyển đổi
result = kakasi.convert(text)
for item in result:
    print("{}: kana '{}', hiragana '{}', romaji: '{}'".format(item['orig'], item['kana'], item['hira'], item['hepburn']))