const xlsx = require("xlsx");
const fs = require("fs");

class ExcelToDto {
  constructor(excelPath, sheetNames) {
    this.worksheet = xlsx.readFile(excelPath).Sheets[sheetNames];
  }
  makeDtoFile = () => {
    let extention = ".java";
    let fileName = "";
    let fileContent = "";
    let startNumber = 0;
    let start = false;
    let sameLineInfo = {};
    let sameLineInfoSet = new Set();
    for (let key in this.worksheet) {
      let number = key.replace(/[A-Za-z]/gi, "") * 1;
      let string = key.replace(/[0-9]/gi, "");
      let data = this.worksheet[key].v;
      if (number === 1 && string === "A") {
        fileName = `${data.replace(" 인터페이스 명세", "")}Dto`;
        fileContent += `@Data\npublic class ${fileName} {\n`;
      }
      if (data && data.indexOf("요청 파라미터 명세") > -1) {
        startNumber = number;
        start = true;
      } else if (data && data.indexOf("요청 본문(Body) 메시지 명세") > -1) {
        startNumber = number;
        start = true;
      }
      if (data && data.indexOf("요청 본문(Body) 메시지 형태(JSON) 예시") > -1) {
        start = false;
      } else if (data && data.indexOf("요청 메시지 형태(JSON) 예시") > -1) {
        start = false;
      }
      if (start) {
        if (startNumber + 1 < number) {
          switch (string) {
            case "A": // 항목명(영문)
              sameLineInfo["name"] = data;
              break;
            case "B": // 항목명(영문)
              sameLineInfo["name"] = data;
              break;
            case "C": // 항목명(영문)
              sameLineInfo["name"] = data;
              break;
            case "D": // 항목명(영문)
              sameLineInfo["name"] = data;
              break;
            case "G": // 타입
              switch (data) {
                case "Int":
                  data = "int";
                  break;
                case "Array":
                  data = `List<${fileName}>`;
                  break;
                default:
                  data = "String";
                  break;
              }
              sameLineInfo["type"] = data;
              break;
            case "H": // 항목설명
              sameLineInfo["explain"] = data;
              sameLineInfoSet.add(JSON.stringify(sameLineInfo)); // 중복제거
              sameLineInfo = {};
              break;
            default:
              break;
          }
        }
      }
    }
    for (let keyStr of sameLineInfoSet) {
      let key = JSON.parse(keyStr);
      let content = `\n\t/* ${key.explain} */\n\t${key.type} ${key.name};\n`;
      fileContent += content;
    }
    fileContent += "\n}";
    if (sameLineInfoSet.size > 0) {
      fs.writeFileSync(fileName + extention, fileContent);
    }
  };
}

const interfaceSheets = [
  "기본",
  "상태",
  "장애",
  "버전",
  "이송요청",
  "핫라인",
  "과밀화",
  "혼잡도",
  "병상",
  "중증",
  "이송자제",
  "환류",
  "NEDIS",
  "타병원",
  "의사",
  "환자",
  "병원",
  "공지사항",
];

for (let value of interfaceSheets) {
  new ExcelToDto(__dirname + "/test.xlsx", value).makeDtoFile();
}

/*
lombok사용의 경우
lombok 사용하지 않은 경우
DTO 형태 예시

@Data
public class 키오스크 설치상태 변경 DTO {
    String erkioskinststatecode;
    String istrname;
    String istrtn;
    String istremail;
    String istloc;
    String istdate;
    String istclrdate;
}

*/
