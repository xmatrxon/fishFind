import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";

const ChangeUsername = ({ authUser }) => {
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
    onSubmit: async () => {
      try {
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

  return (
    <>
      {authUser ? (
        <>
          <div className="flex h-screen w-screen justify-center">
            <div className="w-2/5 self-center">
              <form
                onSubmit={formik.handleSubmit}
                className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
                <h1 className="border-silver border-b-2 border-solid pb-4">
                  Podaj nową nazwę użytkownika
                </h1>
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Nazwa użytkownika
                  </label>
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
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
                    className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    type="submit">
                    Zmień
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ChangeUsername;
