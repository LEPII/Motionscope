const importBlock = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

return res.status(200).json({
      message: "File received.",
      filename: req.file.originalname,
      bytes: req.file.size,
      programId: req.params.programId,
      scope: req.query.scope || "block",
      weekRange: {
        start: req.query.weekStart || null,
        end: req.query.weekEnd || null,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Import failed.",
      error: err?.message || String(err),
    });
  }
};

module.exports = { importBlock };