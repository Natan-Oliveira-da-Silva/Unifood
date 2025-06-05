
const nodemailer = require('nodemailer');

// Esta função cria uma conta de teste no Ethereal e retorna um transportador do Nodemailer
async function createTestTransporter() {
    // Cria uma conta de teste no Ethereal. Isso é assíncrono.
    let testAccount = await nodemailer.createTestAccount();
    console.log("Conta de teste do Ethereal criada:");
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);

    // Cria o objeto transportador reutilizável usando os dados da conta de teste
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user, 
            pass: testAccount.pass, 
        },
    });

    return transporter;
}


module.exports = { createTestTransporter };