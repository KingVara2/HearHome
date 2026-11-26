
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("=================================");
    console.log("HEARHOME - SERVIDOR INICIADO");
    console.log(`http://localhost:${PORT}`);
    console.log("=================================");
});
