import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: any;

      file?: Multer.File;

      files?:
        | {
            [fieldname: string]: Multer.File[];
          }
        | Multer.File[];
    }
  }
}




 

// Define a more specific user interface if possible
interface User {
  id: string;
  role: string; // Adjust based on your actual user object
}

declare global {
  namespace Express {
    interface Request {
      user?: User; // Replace 'any' with a specific interface
      file?: Multer.File; // For single file uploads
      files?: { [fieldname: string]: Multer.File[] }; // For multiple file uploads with fields
    }
  }
}