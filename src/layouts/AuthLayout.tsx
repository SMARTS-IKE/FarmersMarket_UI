import { Outlet } from '@tanstack/react-router';
import logo01 from '../assets/logo-01.svg';
import loginBgImage from '../assets/loginBg.png';

export default function AuthLayout() {
  return (
    <div className="min-h-svh bg-[#f2efe9]">
      <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[1fr_420px]">
        <section className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${loginBgImage})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(30,46,30,0.62)_0%,rgba(37,52,35,0.48)_45%,rgba(48,58,40,0.36)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.22),transparent_44%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.12),transparent_38%)]" />

          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-10 text-[#f4efe6]">
            <div className="flex w-full items-center justify-center gap-10">
              <img
                src={logo01}
                alt="Logo"
                className="w-[500px] object-contain"
              />
              <div className="flex w-[500px] flex-col items-center justify-center text-3xl text-center gap-3 font-bold leading-tight tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                <div className="block whitespace-nowrap">Σύστημα Ηλεκτρονικής</div>
                <div className="block whitespace-nowrap">Διαχείρισης Λαϊκών Αγορών</div>
                <div className='w-full border-b'></div>
              </div>
            </div>
            
          </div>
        </section>

        <section className="flex min-h-svh items-center justify-center bg-[#a8a4a0] p-5 sm:p-8">
          <div className="w-full max-w-sm rounded-[26px] border border-[#b7b1a9] bg-[#d8d5d2] px-7 py-8 shadow-[0_16px_40px_rgba(66,55,45,0.22)]">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
