import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";
import { collection, getDocs, query } from "firebase/firestore";
import { useState, useEffect } from "react";
import Footer from "./Footer";

const ChangeUsername = ({ authUser }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const { state } = useLocation();
  const { id } = state;

  const history = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Nazwa użytkownika jest wymagana"),
    }),
    onSubmit: async (e) => {
      e.preventDefault();
      try {
        await getUsers();

        const matchingUsername = allUsers.find(
          (user) => user.data.username === formik.values.username,
        );

        if (matchingUsername) {
          setErrorMessage(
            "Użytkownik o podanej nazwie użytkownika już istnieje",
          );
          return;
        }

        const reff = doc(db, "users", id);
        await updateDoc(reff, {
          username: formik.values.username,
        });
        history("/account");
      } catch (err) {
        console.log(err);
      }
    },
  });

  const getUsers = async () => {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const userData = [];
    querySnapshot.forEach((doc) => {
      userData.push({ id: doc.id, data: doc.data() });
    });
    setAllUsers(userData);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="changeUsername">
      {authUser ? (
        <div>
          <div className="content-div">
            <div className="form-div">
              <form onSubmit={formik.handleSubmit} className="shadow-md">
                <h1 className="border-silver">Zmień nazwę użytkownika</h1>
                <div className="input-div">
                  <label className="text-gray-700">
                    Nowa nazwa użytkownika
                  </label>
                  <input
                    className="focus:shadow-outline borderleading-tight appearance-none rounded text-gray-700 shadow focus:outline-none"
                    id="username"
                    type="text"
                    placeholder="Nazwa użytkownika"
                    name="username"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.username}
                  />
                  {formik.touched.username && formik.errors.username ? (
                    <p className="text-xs italic text-red-500">
                      {formik.errors.username}
                    </p>
                  ) : null}
                </div>
                <div>
                  <button
                    className="focus:shadow-outline rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    type="submit">
                    Zmień
                  </button>
                </div>
                {errorMessage ? (
                  <div
                    className="error-div bg-red-100text-red-700 relative rounded border border-red-400"
                    role="alert">
                    <span className="block text-red-500 sm:inline">
                      {errorMessage}
                    </span>
                    <span className="error-span absolute bottom-0 right-0 top-0">
                      <svg
                        className="h-6 w-6 fill-current text-red-500"
                        role="button"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        onClick={() => setErrorMessage("")}>
                        <title>Zamknij</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                      </svg>
                    </span>
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      ) : null}
      <Footer />
    </div>
  );
};

export default ChangeUsername;
