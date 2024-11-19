const express = require("express");
const { createUser, authenticateUser } = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ����� ���
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        await createUser(username, password);
        res.status(201).json({ message: "����� ��� ����" });
    } catch (error) {
        console.error("����� ��� ����:", error);
        res.status(500).json({ message: "���� ����", error: error.message });
    }
});

// �α���
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authenticateUser(username, password);

        const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch (error) {
        console.error("�α��� ����:", error);
        res.status(401).json({ message: "�α��� ����", error: error.message });
    }
});

module.exports = router;
