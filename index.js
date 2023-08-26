import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.raw({ type: 'image/*', limit: '100mb' }));


const __dirname = path.dirname('./');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/api/uploadPicture', upload.single('uploadedPicture'), (req, res) => {
  const picture = req.file;

  console.log("/uploadPicture triggered");

  if (!picture) {
    return res.status(400).json({ errorMessage: 'Invalid image data provided' });
  }

  const allowedFormats = ["jpg", "png", "jpeg"];
  const fileExtension = picture.originalname.split('.').pop().toLowerCase();

  if (!allowedFormats.includes(fileExtension)) {
    fs.unlinkSync(picture.path);
    return res.status(401).json({ errorMessage: 'Invalid picture format.' });
  }

  return res.status(200).json({ message: 'Profile Pictuire uploaded successfully.' });
});


app.get('/api/images', (req, res) => {


  const uploadsDir = path.join(__dirname, 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error reading directory' });
    } else {
      const imageFilenames = files.filter(file => file.endsWith('.png'));
      res.status(200).json(imageFilenames);
    }
  });
});

app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).json({ error: 'Image not found' });
    } else {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(data);
    }
  });
});
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
