import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { openAddressSearch } from "../utils/postcode.js";

const USER_PROFILE_KEY = "articlue_user_profile";
const PROFILE_NAME_KEY = "articlue_profile_name";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");

  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const [gender, setGender] = useState("");
  const [military, setMilitary] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [toast, setToast] = useState("");

  const passwordStatus = useMemo(() => {
    return {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passedCount = Object.values(passwordStatus).filter(Boolean).length;
  const isStrongPassword = Object.values(passwordStatus).every(Boolean);
  const isConfirmTyped = passwordConfirm.length > 0;
  const isPasswordMatched = password === passwordConfirm;

  const strength = useMemo(() => {
    if (passedCount <= 1) {
      return { percent: passedCount * 25, text: "비밀번호 강도: 매우 약함", color: "bg-red-500" };
    }

    if (passedCount === 2) {
      return { percent: 50, text: "비밀번호 강도: 보통", color: "bg-amber-500" };
    }

    if (passedCount === 3) {
      return { percent: 75, text: "비밀번호 강도: 좋음", color: "bg-blue-600" };
    }

    return { percent: 100, text: "비밀번호 강도: 안전함", color: "bg-emerald-500" };
  }, [passedCount]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const getSavedUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("articlue_users")) || [];
    } catch {
      return [];
    }
  };

  const saveUser = (user) => {
    const users = getSavedUsers();
    localStorage.setItem("articlue_users", JSON.stringify([...users, user]));
  };

  const saveSignupLoginState = (userProfile) => {
    const loginAt = Date.now();

    const currentUser = {
      name: userProfile.name,
      nickname: userProfile.nickname,
      email: userProfile.email,
      provider: "local",
      loginType: "local",
      loginAt,
    };

    localStorage.setItem("isLogin", "true");
    localStorage.setItem("articlue_current_user", JSON.stringify(currentUser));
    localStorage.setItem("articlue_login_type", "local");
    localStorage.setItem("articlue_login_at", String(loginAt));
    localStorage.setItem(PROFILE_NAME_KEY, userProfile.name);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
  };

  const handleAddressSearch = () => {
    openAddressSearch((data) => {
      setPostcode(data.zonecode || "");
      setAddress(data.address || "");
    });
  };

  const handleSignup = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedNickname = nickname.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedPostcode = postcode.trim();
    const trimmedAddress = address.trim();
    const trimmedDetailAddress = detailAddress.trim();

    const fullAddress = [trimmedAddress, trimmedDetailAddress].filter(Boolean).join(" ");

    if (!trimmedName) return showToast("이름을 입력해 주세요.");
    if (!trimmedNickname) return showToast("닉네임을 입력해 주세요.");
    if (!normalizedEmail) return showToast("이메일을 입력해 주세요.");
    if (!trimmedPhone) return showToast("전화번호를 입력해 주세요.");
    if (!birth) return showToast("생년월일을 입력해 주세요.");
    if (!trimmedPostcode || !trimmedAddress) return showToast("주소 검색을 진행해 주세요.");
    if (!trimmedDetailAddress) return showToast("상세주소를 입력해 주세요.");
    if (!gender) return showToast("성별을 선택해 주세요.");
    if (!military) return showToast("병역여부를 선택해 주세요.");

    if (!isStrongPassword) {
      showToast("안전한 비밀번호 조건을 모두 충족해 주세요.");
      return;
    }

    if (!isPasswordMatched) {
      showToast("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const users = getSavedUsers();
    const duplicatedUser = users.some((user) => user.email === normalizedEmail);

    if (duplicatedUser) {
      showToast("이미 가입된 이메일입니다. 로그인해 주세요.");
      return;
    }

    const userProfile = {
      name: trimmedName,
      nickname: trimmedNickname,
      email: normalizedEmail,
      phone: trimmedPhone,
      birth,
      postcode: trimmedPostcode,
      address: fullAddress,
      baseAddress: trimmedAddress,
      detailAddress: trimmedDetailAddress,
      gender,
      military,
      createdAt: new Date().toISOString(),
    };

    saveUser({
      ...userProfile,
      password,
    });

    saveSignupLoginState(userProfile);

    showToast("회원가입이 완료되었습니다. 홈으로 이동합니다.");

    setTimeout(() => {
      navigate("/home", { replace: true });
    }, 800);
  };

  const PasswordRule = ({ valid, children }) => {
    return (
      <p className={`text-xs font-extrabold leading-7 ${valid ? "text-emerald-600" : "text-red-500"}`}>
        {children}
      </p>
    );
  };

  const inputClass =
    "h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-[15px] text-slate-900 outline-none focus:border-blue-600";

  const readonlyInputClass =
    "h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-[15px] text-slate-900 outline-none";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-8">
      <section className="w-full max-w-[720px] rounded-[28px] border border-slate-200 bg-white p-9 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <Link
          to="/"
          className="mb-4 flex justify-center text-[32px] font-black text-blue-600 no-underline"
        >
          Articlue.
        </Link>

        <h1 className="mb-3 text-center text-[28px] font-black text-slate-900">
          회원가입
        </h1>

        <p className="mb-8 text-center text-sm leading-7 text-slate-600">
          회원가입이 완료되면 자동 로그인되어 홈 화면으로 이동합니다.
        </p>

        <form onSubmit={handleSignup}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-[18px]">
              <label htmlFor="signupNameInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                이름
              </label>
              <input
                id="signupNameInput"
                type="text"
                className={inputClass}
                placeholder="이름 입력"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="mb-[18px]">
              <label htmlFor="signupNicknameInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                닉네임
              </label>
              <input
                id="signupNicknameInput"
                type="text"
                className={inputClass}
                placeholder="닉네임 입력"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                required
              />
            </div>

            <div className="mb-[18px]">
              <label htmlFor="signupEmailInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                이메일
              </label>
              <input
                id="signupEmailInput"
                type="email"
                className={inputClass}
                placeholder="example@email.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="mb-[18px]">
              <label htmlFor="signupPhoneInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                전화번호
              </label>
              <input
                id="signupPhoneInput"
                type="tel"
                className={inputClass}
                placeholder="010-0000-0000"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </div>

            <div className="mb-[18px]">
              <label htmlFor="signupBirthInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                생년월일
              </label>
              <input
                id="signupBirthInput"
                type="date"
                className={inputClass}
                value={birth}
                onChange={(event) => setBirth(event.target.value)}
                required
              />
            </div>

            <div className="mb-[18px]">
              <label htmlFor="signupGenderInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                성별
              </label>
              <select
                id="signupGenderInput"
                className={inputClass}
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                required
              >
                <option value="">성별 선택</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
                <option value="선택 안 함">선택 안 함</option>
              </select>
            </div>

            <div className="mb-[18px]">
              <label htmlFor="signupMilitaryInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                병역여부
              </label>
              <select
                id="signupMilitaryInput"
                className={inputClass}
                value={military}
                onChange={(event) => setMilitary(event.target.value)}
                required
              >
                <option value="">병역여부 선택</option>
                <option value="군필">군필</option>
                <option value="미필">미필</option>
                <option value="해당 없음">해당 없음</option>
              </select>
            </div>

            <div className="mb-[18px]">
              <label htmlFor="signupPostcodeInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                우편번호
              </label>

              <div className="flex gap-2">
                <input
                  id="signupPostcodeInput"
                  type="text"
                  className={readonlyInputClass}
                  placeholder="주소 검색"
                  value={postcode}
                  readOnly
                  required
                />

                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="h-[52px] shrink-0 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  주소 검색
                </button>
              </div>
            </div>

            <div className="col-span-2 mb-[18px]">
              <label htmlFor="signupAddressInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                주소
              </label>
              <input
                id="signupAddressInput"
                type="text"
                className={readonlyInputClass}
                placeholder="주소 검색 버튼을 눌러 주소를 선택해 주세요"
                value={address}
                readOnly
                required
              />
            </div>

            <div className="col-span-2 mb-[18px]">
              <label htmlFor="signupDetailAddressInput" className="mb-2 block text-sm font-extrabold text-slate-900">
                상세주소
              </label>
              <input
                id="signupDetailAddressInput"
                type="text"
                className={inputClass}
                placeholder="상세주소 입력"
                value={detailAddress}
                onChange={(event) => setDetailAddress(event.target.value)}
                required
              />
            </div>
          </div>

          {/* 기존 비밀번호 영역은 그대로 유지 */}
          <div className="mb-[18px]">
            <label htmlFor="passwordInput" className="mb-2 block text-sm font-extrabold text-slate-900">
              비밀번호
            </label>

            <input
              id="passwordInput"
              type="password"
              className={`h-[52px] w-full rounded-2xl border px-4 text-[15px] text-slate-900 outline-none focus:border-blue-600 ${
                password.length > 0 && !isStrongPassword
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 bg-slate-100"
              }`}
              placeholder="영문 소문자, 숫자, 특수문자 포함 8자 이상"
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <div className="mt-2.5 rounded-2xl border border-slate-200 bg-slate-100 px-3.5 py-3" aria-live="polite">
              <p className="mb-2 text-[13px] font-black text-slate-900">
                안전한 비밀번호 조건
              </p>

              <PasswordRule valid={passwordStatus.length}>• 8자 이상 입력</PasswordRule>
              <PasswordRule valid={passwordStatus.lower}>• 영문 소문자 포함</PasswordRule>
              <PasswordRule valid={passwordStatus.number}>• 숫자 포함</PasswordRule>
              <PasswordRule valid={passwordStatus.special}>• 특수문자 포함 (!@#$%^&* 등)</PasswordRule>

              <div className="mt-2.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>

                <p className="mt-2 text-xs font-black text-slate-600">
                  {strength.text}
                </p>
              </div>
            </div>

            {password.length > 0 && !isStrongPassword && (
              <p className="mt-2 text-xs font-black text-red-500">
                안전한 비밀번호 조건을 모두 충족해야 회원가입할 수 있습니다.
              </p>
            )}
          </div>

          <div className="mb-[18px]">
            <label htmlFor="passwordConfirmInput" className="mb-2 block text-sm font-extrabold text-slate-900">
              비밀번호 확인
            </label>

            <input
              id="passwordConfirmInput"
              type="password"
              className={`h-[52px] w-full rounded-2xl border px-4 text-[15px] text-slate-900 outline-none focus:border-blue-600 ${
                isConfirmTyped && !isPasswordMatched
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 bg-slate-100"
              }`}
              placeholder="비밀번호 다시 입력"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              required
            />

            {isConfirmTyped && !isPasswordMatched && (
              <p className="mt-2 text-xs font-black text-red-500">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2.5 h-[54px] w-full rounded-full bg-blue-600 text-[15px] font-black text-white transition hover:bg-blue-700"
          >
            회원가입 후 바로 시작하기
          </button>
        </form>

        <div className="mt-5 flex justify-center gap-2 text-sm">
          <span className="text-slate-600">이미 계정이 있으신가요?</span>
          <Link to="/login" className="font-black text-blue-600 no-underline">
            로그인
          </Link>
        </div>
      </section>

      <div
        className={`fixed bottom-7 right-7 rounded-full bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition-all duration-200 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        {toast || "회원가입이 완료되었습니다."}
      </div>
    </main>
  );
}