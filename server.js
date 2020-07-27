require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverRide = require('method-override');


const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverRide('_method'));

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`I'm Listining ON PORT ${PORT}`)
        })
    })

//=============================\\
// routs 
app.get('/',homeHandler);
app.get('/search', searchHandler);
app.post('/list',listHandler);
app.get('/redirectDB',redirectDBHandler);
app.get('/details/:idDetails',detailsHandler);
app.put('/update/:idDetails',updateHandler);
app.delete('/delete/:idDetails', deleteHandler);


//================================\\
//  Handlers

function searchHandler(req, res) {
    let title = req.query.title;
    let type = req.query.radio;
    let url = `https://api.themoviedb.org/3/search/${type}?api_key=b57f000f605fd0afe9de5722933e8c52&query=${title}`;

    superagent.get(url)
        .then(data => {
            let result = data.body.results.map(value=>{
                return new TvMovie(value);
            })
            res.render('./pages/result',{data: result}) ;          
        })
}

function homeHandler(req,res){
    res.render('index');
}

function listHandler(req,res){
    let {name , poster_path, overview} = req.body;
    let sql = 'INSERT INTO tv_mov (name , poster_path, overview) VALUES ($1 , $2 ,$3);'; 
    let safeValues= [name , poster_path, overview];

    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/redirectDB')
    })
}

function redirectDBHandler(req,res){
    let sql = 'SELECT * FROM tv_mov;';
    client.query(sql)
    .then(data=>{
        res.render('./pages/mylist',{movieResult : data.rows})
    })
}

function detailsHandler(req,res){
    let id = req.params.idDetails;
    let sql = 'SELECT * FROM tv_mov WHERE id = $1;';
    let safeValues = [id];
    client.query(sql,safeValues)
    .then(data=>{
        res.render('./pages/details',{singleDetails : data.rows[0]})
    })
}

function updateHandler(req,res){
    let mID = req.params.idDetails;
    let {name , poster_path, overview} = req.body;
    let sql = 'UPDATE tv_mov SET name=$1 , poster_path=$2 ,overview=$3 WHERE id=$4;';
    let safeValues = [name , poster_path, overview,mID];

    client.query(sql,safeValues)
    .then(()=>{
        res.redirect(`/details/${mID}`);
    })

}

function deleteHandler(req,res){
    let mID = req.params.idDetails;
    let sql = 'DELETE FROM tv_mov WHERE id = $1;';
    let safeValues = [mID];
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/redirectDB');
    })

}


//=============================\\

function TvMovie(data) {
    this.name = data.original_name || 'no name';
    this.overview = data.overview || 'no overview';
    this.poster_path = `https://image.tmdb.org/t/p/original/${data.poster_path}` || 'https://i2.wp.com/quidtree.com/wp-content/uploads/2020/01/placeholder.png?fit=1200%2C800&ssl=1';
}