const binaryBtn = document.getElementById("binaryBtn");
const binaryIn = document.getElementById("binary");
const binaryResult = document.getElementById("binaryResult");
// Binary To Decimal Converter
function binaryToDecimal(){
  let arr = binaryIn.value.split("").reverse();
  let decimal = 0
  for(let i = 0; i < arr.length; i++){
    decimal += arr[i] * (2 ** i)
  }
  binaryResult.innerHTML=`The Decimal Value for (${binaryIn.value})<sub>2</sub> is (${decimal})<sub>10</sub>`;
}
binaryBtn.addEventListener("click", () =>{
   binaryToDecimal();
})