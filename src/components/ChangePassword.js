import { useNavigate } from "react-router-dom";
import { updatePassword, getAuth } from "firebase/auth";
import { useFormik } from "formik";
import * as Yup from "yup";
import Footer from "./Footer";

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
    <div className="changePassword">
      {authUser ? (
        <div>
          <div className="content-div">
            <div className="form-div">
              <form onSubmit={formik.handleSubmit} className="shadow-md">
                <h1 className="border-silver">Zmień hasło</h1>
                <div className="input-div">
                  <label className="text-gray-700">Nowe hasło</label>
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
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
                    className="focus:shadow-outline rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    type="submit">
                    Zmień
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
      <Footer />
    </div>
  );
};

export default ChangePassword;
