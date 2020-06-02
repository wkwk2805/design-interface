const express = require("express");
const axios = require("axios");
const app = express();

const query = "피곤하다";

app.get("/translate", (req, res) => {
  let text = translate(query);
  res.end(text);
});

const translate = async (query) => {
  const api_url = "https://openapi.naver.com/v1/papago/n2mt";
  const client_id = "dC9TWZdZx1utgS2iEMt8";
  const client_secret = "9XDv5L7lKT";
  const result = await axios({
    url: api_url,
    method: "post",
    headers: {
      "X-Naver-Client-Id": client_id,
      "X-Naver-Client-Secret": client_secret,
    },
    data: { source: "ko", target: "en", text: query },
  });
  let text = result.data.message.result.translatedText;
  text = text
    .split(" ")
    .map((e) => e.replace(/^./, e[0].toUpperCase()))
    .join("");
  return text;
};

app.listen(3000, () => {
  console.log("app listening on port 3000!");
});
