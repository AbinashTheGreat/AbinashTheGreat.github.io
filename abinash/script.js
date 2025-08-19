const decimal = document.getElementById("decimal")
const binaryBtn = document.getElementById("btn")
const result = document.getElementById("result")
let binaryList = [];

// Binary Converter
function binaryConverter(){
  let dec = decimal.value;
  while(dec > 0 ){
    if(dec % 2 === 0 ){
      binaryList.push(0)
      dec = Math.floor(dec / 2);
    }else{
      binaryList.push(1);
      dec = Math.floor(dec / 2);
    }
  }
  console.log(binaryList)
  let reverseBinary = binaryList.reverse().join("");
  result.innerHTML = `The Binary Value for (${decimal.value})<sub>10</sub> is (${reverseBinary})<sub>2</sub>`;
  console.log(reverseBinary)
  decimal.value = "";
}
binaryBtn.addEventListener("click", () =>{
  binaryConverter()
  binaryList = []
})