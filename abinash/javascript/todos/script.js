const inputBox = document.getElementById("input-box")
const listContainer = document.getElementById("list-container")

// To append the LI in UL
function addTask(){
    if(inputBox.value ===""){
        alert("You must write something!")
    } else{
        let li = document.createElement("li")
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);
        let span = document.createElement("span")
        span.innerHTML = "\u00d7"
        li.appendChild(span)
    }
    inputBox.value = "";
    saveData();
}

// To Delete and Check the todo lists 
listContainer.addEventListener("click", function(e){
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked")
        saveData()
    } 
    else if(e.target.tagName === "SPAN"){
        e.target.parentElement.remove()
        saveData()
    }
}, false)

// To create localStorage
function saveData(){
    localStorage.setItem("data", listContainer.innerHTML)
}

// To show data
function showTask(){
    listContainer.innerHTML = localStorage.getItem("data")
}
showTask();