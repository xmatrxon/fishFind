import { useNavigate } from "react-router-dom";
import { updatePassword, getAuth } from "firebase/auth";
import { useFormik } from "formik";
import * as Yup from "yup";

const ChangePassword = ({ authUser }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const history = useNavigate();

  const formik = useFormik({
    initialValues: {
      password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required("Hasło jest wymagane")
        .min(8, "Minimalna długość hasła to 8 znaków"),
    }),
    onSubmit: async () => {
      await updatePassword(user, formik.values.password)
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
      history("/account");
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
                  Podaj nowe hasło
                </h1>
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Hasło
                  </label>
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    id="password"
                    type="password"
                    placeholder="********"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <p className="text-xs italic text-red-500">
                      {formik.errors.password}
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

export default ChangePassword;
