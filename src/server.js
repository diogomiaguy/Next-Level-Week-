const express = require("express")
const server = express()

// banco de dados
const db = require("./database/db")

// configurar pasta PUBLIC css/js/assets ...
server.use(express.static("public"))

// habilitar req.body na aplicação
server.use(express.urlencoded({ extended: true }))


// configura o template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


// configurar rotas da minha aplicação
// página index
// req: Requisição | res: Resposta
server.get("/", (req, res) => {
    return res.render("index.html", { title: "Um título"})
})

server.get("/create-point", (req, res) => {

    // req.query: Query Strings da nossa url
    // console.log(req.query)

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {

    // req.body: O corpo do formulário
    // ver dados enviados => console.log(req.body)

    // inserir dados no banco de dados
    const query = `
        INSERT INT places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            // return res.send("Erro no cadastro!")
            return res.render("create-point.html", {
                msgErro: "Oops! Houve um erro no cadastro.",
                notsaved: true
            })
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", {saved: true})
    }
    db.run(query, values, afterInsertData)

})



server.get("/search", (req, res) => {

    const search = req.query.search

    if(search == "") {
        // pesquisa vazia
        return res.render("search-results.html", { total: 0})
    }

    // pegar os dados do banco 
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }

        const total = rows.length

        // mostrar a página html com os dados do banco
        return res.render("search-results.html", { places: rows, total })
    })
})


// ligar o servidor
server.listen(3000, () =>{
    console.log('Servidor iniciado...')
})