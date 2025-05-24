const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const serviceAccount = require('./projeto-node-dbcbf-firebase-adminsdk-fbsvc-fdeda1e205.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async (req, res) => {
  try {
    const agendamentos = [];
    const snapshot = await db.collection('agendamentos').get();
    snapshot.forEach(doc => {
      agendamentos.push({ id: doc.id, ...doc.data() });
    });
    res.render("consulta", { agendamentos });
  } catch (error) {
    console.error(error);
    res.send("Erro ao buscar agendamentos");
  }
});

app.get("/editar/:id", async (req, res) => {
  try {
    const doc = await db.collection('agendamentos').doc(req.params.id).get();
    if (!doc.exists) {
      return res.send("Documento não encontrado");
    }
    // Envia o objeto como 'post' para o template, assim pode acessar direto
    const post = { id: doc.id, ...doc.data() };
    res.render("editar", { post });
  } catch (error) {
    console.error(error);
    res.send("Erro ao carregar agendamento");
  }
});

app.post("/atualizar", async (req, res) => {
  try {
    const { id, nome, telefone, origem, data_contato, observacao } = req.body;
    await db.collection('agendamentos').doc(id).update({
      nome,
      telefone,
      origem,
      data_contato,
      observacao
    });
    res.redirect("/consulta");
  } catch (error) {
    console.error(error);
    res.send("Erro ao atualizar agendamento");
  }
});

app.post('/deletar/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('agendamentos').doc(id).delete();
    res.redirect('/consulta');
  } catch (error) {
    console.error(error);
    res.send("Erro ao deletar agendamento");
  }
});


app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})

const { engine } = require("express-handlebars");

const hbs = engine({
  defaultLayout: "main",
  helpers: {
    eq: (a, b) => a === b
  }
});

app.engine("handlebars", hbs);
app.set("view engine", "handlebars");
