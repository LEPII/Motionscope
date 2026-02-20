const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const isXlsxExt = file.originalname.toLowerCase().endsWith(".xlsx");

  // Some exports come through as octet-stream; extension check helps.
  const isXlsxMime =
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/octet-stream";

  if (isXlsxExt && isXlsxMime) return cb(null, true);

  cb(
    new Error("Invalid file type. Please upload a .xlsx file exported from Sheets.")
  );
};

const uploadXlsx = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, 
});

module.exports = { uploadXlsx };
