
perPage.addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
        localStorage.setItem("number", perPage.value);
        perPage.value = "";
        window.location.href = "/";
    }
})
function fet(num, pageIndex) {
    let url = `/api/v1/todos?per_page=${num}&per_index=${pageIndex}`;
    fetch(url)
        .then(async (data) => {
            let todo = await data.json();
            return todo;
        })
        .then((data) => {
            let render = '';
            for (let i = 0; i < data.length; i++) {
                render += `
                    <div class="todoapp">
                        <input class="check" type="checkbox">
                        <div class="todo">${data[i].title}</div>
                        <i class="del fa-solid fa-trash fa-2x"></i>
                    </div>
            `
            }
            todoList.innerHTML = render;
            return data;
        })
        .then((data) => {
            let todo = document.getElementsByClassName("todo");
            let sum = 0;
            let check = document.getElementsByClassName("check");
            for (let i = 0; i < data.length; i++) {
                if (data[i].completed == false) {
                    sum += 1;
                } else {
                    check[i].checked = "checked";
                    todo[i].innerHTML = `<strike>${todo[i].innerText}</strike>`;
                }
            }
            count.innerHTML = sum;
        })
        .then(() => {
            let del = document.getElementsByClassName("del");
            let todo = document.getElementsByClassName("todo");
            for (let i = 0; i < del.length; i++) {
                del[i].addEventListener('click', () => {
                    let delData = { title: todo[i].innerText };
                    let url2 = `/api/v1/todos`;
                    fetch(url2, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(delData)
                    })
                        .then(async (res) => {
                            let mes = await res.json();
                            alert(`${mes.message}`);
                            window.location.href = "/";
                        })
                })
            }
        })
}

fetch('/api/v1/todos')
    .then(async (data) => {
        return await data.json();
    })
    .then((data) => {
        let number = localStorage.getItem("number");
        if (number == undefined) {
            number = 5;
        }
        let pageLength = Math.ceil(data.length / number);
        let order = "";
        if (pageLength < 5) {
            for (let i = 0; i < pageLength; i++) {
                order += `
                <span class="order"><a>${i + 1}</a></span>
                `
            }
        } else {
            for (let i = 0; i < 5; i++) {
                order += `
                <span class="order"><a>${i + 1}</a></span>
                `
            }
        }
        pageId.innerHTML = order;
        let orderindex = document.getElementsByClassName("order");
        previos.disabled = true;
        orderindex[0].style['background-color'] = "red";
        fet(number, 1);
        for (let i = 0; i < orderindex.length; i++) {
            orderindex[i].addEventListener("click", () => {
                for (let j = 0; j < orderindex.length; j++) {
                    orderindex[j].style['background-color'] = "white";
                }
                let pageIndex = orderindex[i].innerText;
                orderindex[i].style['background-color'] = "red";
                fet(number, pageIndex);
            })
        }
        previos.addEventListener('click', () => {
            if (orderindex[0].style['background-color'] == "red") {
                for (let i = 0; i < orderindex.length; i++) {
                    orderindex[i].innerText = Number(orderindex[i].innerText) - 1;
                }
                orderindex[0].style['background-color'] = "red";
                fet(number, orderindex[0].innerText);
            } else {
                for (let i = 1; i < orderindex.length; i++) {
                    if (orderindex[i].style['background-color'] == "red") {
                        orderindex[i].style['background-color'] = "white";
                        orderindex[i - 1].style['background-color'] = "red";
                        fet(number, orderindex[i - 1].innerText);
                        break;
                    }
                }
            }
            if (orderindex[0].style['background-color'] == "red" && orderindex[0].innerText == "1") {
                previos.disabled = true;
            }
            if (next.disabled == true) {
                next.disabled = false;
            }

        })
        next.addEventListener('click', () => {
            if (orderindex[4].style['background-color'] == "red") {
                for (let i = 0; i < orderindex.length; i++) {
                    orderindex[i].innerText = Number(orderindex[i].innerText) + 1;
                }
                orderindex[4].style['background-color'] = "red";
                fet(number, orderindex[4].innerText);
            }
            for (let i = 0; i < orderindex.length - 1; i++) {
                if (orderindex[i].style['background-color'] == "red") {
                    orderindex[i].style['background-color'] = "white";
                    orderindex[i + 1].style['background-color'] = "red";
                    fet(number, orderindex[i + 1].innerText);
                    break;
                }
            }
            if (orderindex[4].style['background-color'] == "red" && orderindex[4].innerText == `${pageLength}`) {
                console.log(orderindex[4].innerText);
                next.disabled = true;
            }
            if (previos.disabled == true) {
                previos.disabled = false;
            }
        })

    })

upload.addEventListener('submit', (e) => {
    e.preventDefault();
    let url2 = `/api/v1/todos`;
    fetch(url2).then(async (data) => {
        let todo = await data.json();
        return todo;
    })
        .then((data) => {
            let uploadFile = {
                userId: 1,
                id: data.length + 1,
                title: upload.dataUp.value,
                completed: false
            }
            if (uploadFile.title == "") {
                alert(`Không được để trống`);
            } else {
                fetch(`/api/v1/todos`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(uploadFile)
                })
                    .then(async (res) => {
                        let mes = await res.json();
                        alert(`${mes.message}`);
                        if (mes.message == 'Create successfully') {
                            window.location.href = "/";
                        }
                    })
            }
        })

})
update.addEventListener("click", () => {
    let dataUpdate = [];
    let check = document.getElementsByClassName("check");
    let todo = document.getElementsByClassName("todo");
    for (let i = 0; i < todo.length; i++) {
        let obj = {};
        obj.title = todo[i].innerText;
        if (check[i].checked == true) obj.completed = true
        else obj.completed = false;
        dataUpdate.push(obj);
    }
    console.log(dataUpdate);
    let url2 = `/api/v1/todos`;
    fetch(url2, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataUpdate)
    })
        .then(async (res) => {
            let mes = await res.json();
            alert(`${mes.message}`);
            window.location.href = "/";
        })
})

totalBtn.addEventListener('click', () => {
    let url2 = '/api/v1/todos';
    fetch(url2, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: "all" })
    })
        .then(async (res) => {
            let mes = await res.json();
            alert(`${mes.message}`);
            window.location.href = "/";
        })
})
