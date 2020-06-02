const xlsx = require("xlsx");
// const axios = require("axios");
const fs = require("fs");

class ExcelToJava {
  constructor(excelPath, sheetName) {
    this.worksheet = xlsx.readFile(excelPath).Sheets[sheetName];
  }
  // 한글번역
  translate = async (query) => {
    try {
      /* const api_url = "https://openapi.naver.com/v1/papago/n2mt";
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
    return text; */
      return query;
    } catch (e) {
      console.log(e);
    }
  };

  makeFileName = async () => {
    let fileContent = "";
    let prevFileName = "";
    let isSameName = false;
    let fileName = "";
    let extension = ".java";
    let urls = [];
    let methods = [];
    let methodNames = [];
    let comments = [];
    for (let key in this.worksheet) {
      let number = key.replace(/[A-Za-z]/gi, "");
      if (number == 1 || number == 2) {
        continue;
      }
      let string = key.replace(/[0-9]/gi, "");
      let data = this.worksheet[key].v;
      switch (string) {
        case "C":
          if (fileName === "") {
            isSameName = true;
          }
          fileName = await this.translate(data);
          if (prevFileName !== "") {
            isSameName = prevFileName !== fileName;
          }
          break;
        case "E": // function Name
          let result2 = await this.translate(data);
          result2 = result2.replace(/^./, result2[0].toLowerCase());
          methodNames.push(result2);
          break;
        case "J": // url
          let result = this.handleURL(data);
          urls.push(result);
          break;
        case "L": // method
          let method = data.toLowerCase();
          method = method.replace(/^./, method[0].toUpperCase());
          methods.push("@" + method + "Mapping");
          break;
        case "M":
          comments.push(`/* ${data} */`);
          break;
        default:
          let last = this.worksheet[
            Object.keys(this.worksheet)[Object.keys(this.worksheet).length - 1]
          ];
          if (last === this.worksheet[key]) {
            isSameName = true;
          }
          break;
      }
      if (isSameName) {
        if (prevFileName !== "") {
          fileContent = `public class ${prevFileName} {\n\n`;
          for (let i in urls) {
            let content = `\t${comments[i]}\n\t${methods[i]}("${
              urls[i]
            }")\n\tpublic void ${
              methodNames[i]
            }(@ModelAttribute ${prevFileName}Dto ${prevFileName.replace(
              /^./,
              prevFileName[0].toLowerCase()
            )}Dto${
              urls[i].indexOf("{") !== -1
                ? ", @PathVariable Map<String, Object> pathParam"
                : ""
            }){}\n\n`;
            fileContent += content;
          }
          fileContent += "}";
          fs.writeFileSync(prevFileName + extension, fileContent);
        }
        urls = [];
        methods = [];
        methodNames = [];
        comments = [];
        isSameName = false;
        prevFileName = fileName;
      }
    }
  };

  handleURL = (data) => {
    const questionMarkIndex = data.indexOf("?");
    if (questionMarkIndex === -1) {
      return data;
    } else {
      return data.split("?")[0];
    }
  };
}

new ExcelToJava(__dirname + "/test.xlsx", "인터페이스 목록").makeFileName();
