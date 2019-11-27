const express = require("express");
const fileupload = require("express-fileupload");
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(fileupload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {

    let id = req.params.id;
    let tipo = req.params.tipo;

    if (!req.files) {
        res.status(400).json({
            ok: false,
            err: {
                message: "not file"
            }
        });
    }

    let validTypes = ["usuarios", "productos"];

    if (validTypes.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: "the type is not valid, the valid type are: " + validTypes.join(", ")
            }
        });
    }

    let file = req.files.samplefile;
    let cutName = file.name.split(".");
    let extension = cutName[cutName.length - 1];

    let fileExtension = ["jpg", "jpeg", "png", "gif"];

    if (fileExtension.indexOf(extension) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: "the extension is not valid, the valid extensions are: " + fileExtension.join(", ")
            }
        });
    }

    let fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;

    file.mv(`uploads/${tipo}/${fileName}`, (err) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        imagenProducto(id, res, fileName, tipo);

    })
});

function deleteFile(fileName, type) {

    let pathImg = path.resolve(__dirname, `../../uploads/${type}/${fileName}`)
    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg)
    };
}

function imagenUsuario(id, res, fileName, type) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            deleteFile(fileName, type);

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            deleteFile(fileName, type);

            return res.status(500).json({
                ok: false,
                err
            });
        }

        deleteFile(fileName, type);

        usuarioDB.img = fileName;

        usuarioDB.save((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                usuarioDB
            });
        });
    })

}

function imagenProducto(id, res, fileName, type) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            deleteFile(fileName, type);

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            deleteFile(fileName, type);

            return res.status(500).json({
                ok: false,
                err
            });
        }

        deleteFile(fileName, type);

        productoDB.img = fileName;

        productoDB.save((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productoDB
            });
        });
    })

}

module.exports = app;