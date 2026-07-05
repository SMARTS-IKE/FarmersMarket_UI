import { Outlet } from '@tanstack/react-router';
import logo01 from '../assets/LOGO_WHITE.svg';
import loginBgImage from '../assets/loginBg.png';
import loginPageSideGraphic from '../assets/login_page_side_graphic.svg';

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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.22),transparent_44%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.12),transparent_80%)]" />

          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-10 text-[#f4efe6]">
            <div className="flex w-full items-center justify-center gap-20">
              <img
                src={logo01}
                alt="Logo"
                className="w-[318px] object-contain"
              />
              <div className="flex w-[400px] pt-14 flex-col items-center justify-center text-3xl font-medium leading-tight tracking-tight ">
                <div className="block whitespace-nowrap">Σύστημα Ηλεκτρονικής</div>
                <div className="block whitespace-nowrap">Διαχείρισης Λαϊκών Αγορών</div>
                <div className='w-full border-b pt-2'></div>
              </div>
            </div>
            
          </div>
        </section>

        <section className="relative flex min-h-svh items-start justify-center overflow-hidden bg-[#a8a4a0] px-5 pt-8 pb-5 sm:px-8 sm:pt-10 sm:pb-8">
          <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center px-5 sm:px-0">
            <div className="w-full rounded-[26px] border border-[#b7b1a9] bg-[#d8d5d2] px-7 py-8 shadow-[0_16px_40px_rgba(66,55,45,0.22)]">
              <Outlet />
            </div>
          </div>

          <img
            src={loginPageSideGraphic}
            alt="Login side graphic"
            className="pointer-events-none absolute bottom-[-1.25rem] right-[-1.25rem] hidden w-[calc(100%+1.25rem)] max-w-none sm:bottom-[-2rem] sm:right-[-2rem] sm:w-[calc(100%+2rem)] lg:block"
          />
        </section>
      </div>
    </div>
  );
}
