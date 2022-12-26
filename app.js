const express = require("express");
const fs = require("fs");
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const morgan = require("morgan");
var upload = multer();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.array());
app.use(express.static('todoapp'));



// app.get("/", (req, res) => {
//     res.send("Hello World!");
// })
function checkExits(req, res, next) {
    var data = fs.readFileSync("./ask-community-project/todos.json", { encoding: "utf8" });
    switch (req.method) {
        case "POST":
            console.log(req.body);
            var title = JSON.parse(data).find(item => item.title == req.body.title);
            if (title == undefined) next()
            else res.json({ message: "Todo already exists" });
            break;
        default:
            if (req.params.id != undefined) {
                var check = JSON.parse(data).find(item => item.id == req.params.id);
                if (check != undefined) next()
                else res.json({ message: "Todo not found" });
                break;
            } else {
                if (req.body.title != "all") {
                    var check = JSON.parse(data).find(item => item.title == req.body.title);
                    if (check != undefined) next()
                    else res.json({ message: "Todo not found" });
                } else next()
            }
    }
}

app.get('/api/v1/todos/:id', checkExits, (req, res) => {
    let id = req.params.id;
    fs.readFile("./ask-community-project/todos.json", (err, data) => {
        let result = JSON.parse(data).find(item => item.id == id);
        res.send(result);
    })
})

app.post('/api/v1/todos', checkExits, (req, res) => {
    fs.readFile("./ask-community-project/todos.json", (err, data) => {
        let dataPars = JSON.parse(data);
        dataPars.unshift(req.body);
        fs.writeFileSync('./ask-community-project/todos.json', JSON.stringify(dataPars))
        res.json({ message: "Create successfully" });
    })
})

app.put('/api/v1/todos/:id', checkExits, (req, res) => {
    let id = req.params.id;
    fs.readFile("./ask-community-project/todos.json", (err, data) => {
        let dataPars = JSON.parse(data);
        for (let i = 0; i < dataPars.length; i++) {
            if (dataPars[i].id == id) {
                dataPars[i] == req.body;
                break;
            }
        }
        fs.writeFileSync('./ask-community-project/todos.json', JSON.stringify(dataPars));
        res.json({ message: "Update successfully" });
    })
})

app.put('/api/v1/todos', (req, res) => {
    let update = req.body;
    console.log(update);
    fs.readFile("./ask-community-project/todos.json", (err, data) => {
        let dataPars = JSON.parse(data);
        for (let i = 0; i < dataPars.length; i++) {
            for (let j = 0; j < update.length; j++) {
                if (dataPars[i].title == update[j].title) {
                    dataPars[i].completed = update[j].completed;
                    break;
                }
            }
        }

        fs.writeFileSync('./ask-community-project/todos.json', JSON.stringify(dataPars));
        res.json({ message: "Update successfully" });
    })
})

app.delete('/api/v1/todos/:id', checkExits, (req, res) => {
    let id = req.params.id;
    fs.readFile("./ask-community-project/todos.json", (err, data) => {
        let dataPars = JSON.parse(data);
        for (let i = 0; i < dataPars.length; i++) {
            if (dataPars[i].id == id) {
                dataPars.splice(i, 1);
                break;
            }
        }
        fs.writeFileSync('./ask-community-project/todos.json', JSON.stringify(dataPars));
        res.json({ message: "Delete successfully" });
    })
})

app.delete('/api/v1/todos', checkExits, (req, res) => {
    let delData = req.body;
    console.log(delData);
    if (delData.title != "all") {
        fs.readFile("./ask-community-project/todos.json", (err, data) => {
            let dataPars = JSON.parse(data);
            for (let i = 0; i < dataPars.length; i++) {
                if (dataPars[i].title == delData.title) {
                    dataPars.splice(i, 1);
                    break;
                }
            }
            fs.writeFileSync('./ask-community-project/todos.json', JSON.stringify(dataPars));
            res.json({ message: "Delete successfully" });
        })
    } else {
        fs.writeFileSync('./ask-community-project/todos.json', JSON.stringify([]));
        res.json({ message: "Delete all successfully" });
    }
})

app.get("/", (req, res) => {
    res.sendFile("todoapp.html", { root: './todoapp' })
})

app.get("/api/v1/todos", (req, res) => {
    if (req.query.per_page == undefined) {
        fs.readFile("./ask-community-project/todos.json", (err, data) => {
            if (err) throw err;
            res.send(JSON.parse(data))
        })
    } else {
        fs.readFile("./ask-community-project/todos.json", (err, data) => {
            if (err) throw err;
            let dataParse = JSON.parse(data);
            if (req.query.per_page <= dataParse.length) {
                let result = [];
                let start = req.query.per_page * (req.query.per_index - 1);
                let end = start + Number(req.query.per_page);
                for (let i = start; i < end; i++) {
                    result.push(dataParse[i]);
                }
                res.send(result);
            } else res.send(dataParse);
        })
    }
})


app.listen(3000)