const {createServer} = require("http")
const app = require("./app")
const{Server} = require("socket.io") //웹 소켓 만들기
require("dotenv").config();

const httpServer = createServer(app)
const io = new Server(httpServer,{
    cors:{
        origin:"http://localhost:3000"
    }
})
require("./utils/io")(io);
httpServer.listen(process.env.PORT, () => {
    console.log(`서버가 포트 ${process.env.PORT}에서 시작되었습니다.`);
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
});