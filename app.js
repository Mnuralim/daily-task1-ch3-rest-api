import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import morgan from "morgan";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
  console.log("Hello middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const port = process.env.PORT || 3000;

//tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//users
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
);

//tours
const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      requestTime: req.requestTime,
      tours,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newData = Object.assign(
    {
      id: newId,
    },
    req.body
  );
  tours.push(newData);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newData,
        },
      });
    }
  );
};

const getTourById = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((el) => el.id === Number(id));

  if (!tour)
    return res.status(404).json({
      status: "failed",
      message: "Data not found",
    });

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

const updateTour = (req, res) => {
  const { id } = req.params;
  const tourIndex = tours.findIndex((el) => el.id === Number(id));
  console.log(tourIndex);
  if (tourIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: "Data not found",
    });
  }
  tours[tourIndex] = {
    ...tours[tourIndex],
    ...req.body,
  };
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: "success",
        message: `Data with id ${id} edited`,
        data: {
          tour: tours[tourIndex],
        },
      });
    }
  );
};

const deleteTour = (req, res) => {
  const { id } = req.params;
  const tourIndex = tours.findIndex((el) => el.id === Number(id));
  console.log(tourIndex);
  if (tourIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: "Data not found",
    });
  }
  tours.splice(tourIndex, 1);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: "success",
        message: `Berhasil delete data`,
        data: {
          tour: null,
        },
      });
    }
  );
};

//users
const getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
};

const createUser = (req, res) => {
  const newId = crypto.randomUUID();
  const newData = Object.assign(
    {
      _id: newId,
    },
    req.body
  );
  users.push(newData);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          user: newData,
        },
      });
    }
  );
};

const getUserById = (req, res) => {
  const { id } = req.params;
  const user = users.find((el) => el._id === id);

  if (!user)
    return res.status(404).json({
      status: "failed",
      message: "Data not found",
    });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((el) => el._id === id);
  if (userIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: "Data not found",
    });
  }
  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
  };
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(200).json({
        status: "success",
        message: `Data with id ${id} edited`,
        data: {
          user: users[userIndex],
        },
      });
    }
  );
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((el) => el._id === id);
  if (userIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: "Data not found",
    });
  }
  users.splice(userIndex, 1);

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(200).json({
        status: "success",
        message: `Berhasil delete data`,
        data: {
          user: null,
        },
      });
    }
  );
};

const tourRouter = express.Router();
const userRouter = express.Router();

//tours route
tourRouter.route("/").get(getAllTours).post(createTour);
tourRouter.route("/:id").get(getTourById).patch(updateTour).delete(deleteTour);

//users route
userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);

app.listen(port, () => console.log(`Server is running on port ${port}`));
