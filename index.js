// https://github.com/bostaapp/be-assessment/blob/master/README.md


require("dotenv").config();
require("./db/connection");
const express = require("express")
const app = express()
const cors = require("cors")
const helmet = require("helmet")
const hpp = require("hpp")
const { errorHandler } = require("./middlewares/error")
const PORT = process.env.PORT || 8000

// const users = require("./routes/user.route")
// const checks = require("./routes/check.route")
// const reports = require("./routes/report.route")

app.use(express.json())
app.use(hpp())
app.use(cors())
app.use(helmet());

// app.use("/api/users", users)
// app.use("/api/checks", checks)
// app.use("/api/reports", reports)
app.use(errorHandler)

app.get("/", (req, res) => {
    res.send('<h1>Up-Time Monitor</h1>')
})
app.listen(PORT, () => console.log(`running on port ${PORT}`))