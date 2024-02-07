import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Footer from "./Footer";

const ResetPassword = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Niepoprawny adres email")
        .required("Adres email jest wymagany"),
    }),
    onSubmit: async () => {
      try {
        await sendPasswordResetEmail(auth, formik.values.email);
        alert("Sprawdź swoją skrzynkę pocztową");
        history("/signin");
      } catch (err) {
        console.log(err);
      }
    },
  });

  const history = useNavigate();
  const auth = getAuth();

  return (
    <>
      <div className="sss flex w-full justify-center text-center">
        <div className="w-2/5 self-center">
          <form
            onSubmit={formik.handleSubmit}
            className="mb-4 rounded bg-[#fafafa] px-8 pb-8 pt-6 shadow-md">
            <h1 className="border-silver border-b-2 border-solid pb-4">
              Zresetuj hasło
            </h1>
            <div className="mb-6 pt-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Adres email
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="username"
                type="text"
                placeholder="Email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="text-xs italic text-red-500">
                  {formik.errors.email}
                </p>
              ) : null}
            </div>
            <div>
              <button
                className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                type="submit">
                Zresetuj
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
