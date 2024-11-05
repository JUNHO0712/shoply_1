const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(bodyParser.json());

// MariaDB 데이터베이스 연결
const connection = mysql.createConnection({
    host: 'localhost', 
    //MySQL 데이터베이스 서버의 호스트 이름 또는 IP 주소를 지정합니다. 
    //로컬 서버에 연결하려면 'localhost'를 사용합니다.
    user: 'root', // MariaDB 사용자 이름
    password: '', // MariaDB 비밀번호
    database: 'shoply_customer' // 사용할 데이터베이스 이름
});

// 데이터베이스 연결 확인
connection.connect((err) => {
    if (err) {
        console.error('MariaDB 연결 실패:', err);
        return;
    }
    console.log('MariaDB에 연결되었습니다.');
});

const bcrypt = require('bcrypt');

// 회원가입 라우트
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // 중복 계정 확인 쿼리
    const checkQuery = 'SELECT * FROM customer_id WHERE name = ? AND email = ?';
    connection.query(checkQuery, [name, email], async (err, results) => {
        if (err) {
            console.error('중복 확인 실패:', err);
            return res.status(500).send('회원가입 실패');
        }

        if (results.length > 0) {
            // 동일한 계정이 이미 존재
            return res.status(409).send('이미 존재하는 계정입니다');
        }

        // 비밀번호 해싱
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            // 사용자 데이터 삽입 쿼리
            const query = 'INSERT INTO customer_id (name, email, password) VALUES (?, ?, ?)';
            connection.query(query, [name, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('회원가입 실패:', err.stack);
                    return res.status(500).send('회원가입 실패');
                }
                res.status(201).send('회원가입 성공');
            });
        } catch (error) {
            console.error('비밀번호 해싱 실패:', error);
            res.status(500).send('회원가입 실패');
        }
    });
});

// 로그인 라우트
app.post('/login', (req, res) => {
    const { name, password } = req.body; // 사용자가 입력한 이름과 비밀번호

    // SQL 쿼리: name을 기반으로 사용자 조회
    const query = 'SELECT * FROM customer_id WHERE name = ?';

    connection.query(query, [name], (err, results) => { // name을 쿼리 파라미터로 전달
        if (err) {
            console.error('사용자 조회 실패:', err);
            return res.status(500).send('로그인 실패');
        }

        if (results.length === 0) {
            return res.status(401).send('사용자 이름 또는 비밀번호가 잘못되었습니다');
        }

        const user = results[0]; // 데이터베이스에서 가져온 사용자 정보

        // 입력된 비밀번호와 데이터베이스에 저장된 해시된 비밀번호 비교
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('비밀번호 비교 중 오류 발생:', err);
                return res.status(500).send('로그인 실패');
            }

            if (isMatch) {
                // 로그인 성공
                console.log('로그인 성공:', user.name); // 사용자 이름 출력
                return res.status(200).send('로그인 성공');
            } else {
                // 비밀번호가 일치하지 않음
                return res.status(401).send('사용자 이름 또는 비밀번호가 잘못되었습니다');
            }
        });
    });
});
// 비밀번호 재설정 라우트
app.post('/reset_password', async (req, res) => {
    const { name, email, newPassword } = req.body;
    console.log(req.body);
    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10); // 10은 salt rounds

        // 사용자 데이터 조회 쿼리
        const query = 'SELECT * FROM customer_id WHERE name = ? AND email = ?';
        connection.query(query, [name, email], (err, results) => {
            if (err) {
                console.error('사용자 조회 실패:', err.stack);
                return res.status(500).send('사용자 조회 실패');
            }

            if (results.length === 0) {
                return res.status(404).send('사용자를 찾을 수 없습니다');
            }

            // 비밀번호 업데이트 쿼리
            const updateQuery = 'UPDATE customer_id SET password = ? WHERE name = ? AND email = ?';
            connection.query(updateQuery, [hashedPassword, name, email], (err, results) => {
                if (err) {
                    console.error('비밀번호 재설정 실패:', err.stack);
                    return res.status(500).send('비밀번호 재설정 실패');
                }
                if (results.affectedRows === 0) {
                    return res.status(404).send('비밀번호 재설정 실패, 사용자 정보를 찾을 수 없습니다');
                }
                res.status(200).send('비밀번호가 성공적으로 재설정되었습니다');
            });
        });
    } catch (error) {
        console.error('비밀번호 해싱 실패:', error);
        res.status(500).send('비밀번호 재설정 실패');
    }
});
// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});