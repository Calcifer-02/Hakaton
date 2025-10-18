const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./authRouter')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express()

app.use(express.json())

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')))

// API роуты
app.use("/auth", authRouter)

// Главная страница - редирект на форму входа
app.get('/', (req, res) => {
    res.redirect('/index.html');
})

const start = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || `mongodb+srv://calcifer_db_user:HNavHBZiD9gaDRhg@cluster0.xfoxsu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('MongoDB connected successfully')
        app.listen(PORT, () => console.log(`server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
