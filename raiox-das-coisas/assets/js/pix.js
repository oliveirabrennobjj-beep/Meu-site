// Gera o código "Pix copia e cola" (BR Code estático) seguindo o manual do Banco Central.
(function (root) {
  const field = (id, value) => id + String(value.length).padStart(2, "0") + value;

  // Remove acentos e símbolos que o padrão não aceita nos campos de nome e cidade.
  const clean = (text, max) =>
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .toUpperCase()
      .trim()
      .slice(0, max);

  // CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF).
  const crc16 = (payload) => {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  const brcode = ({ key, name, city, amount, txid = "***" }) => {
    const account = field("00", "br.gov.bcb.pix") + field("01", key.trim());
    let payload =
      field("00", "01") +
      field("01", "11") +
      field("26", account) +
      field("52", "0000") +
      field("53", "986") +
      (amount ? field("54", Number(amount).toFixed(2)) : "") +
      field("58", "BR") +
      field("59", clean(name, 25)) +
      field("60", clean(city, 15)) +
      field("62", field("05", txid)) +
      "6304";
    return payload + crc16(payload);
  };

  root.Pix = { brcode, crc16 };
  if (typeof module !== "undefined") module.exports = root.Pix;
})(typeof window !== "undefined" ? window : globalThis);
