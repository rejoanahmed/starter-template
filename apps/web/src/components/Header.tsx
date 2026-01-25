import {
  Globe,
  Logout01Icon,
  Menu01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@starter/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@starter/ui/components/dropdown-menu";
import { cn } from "@starter/ui/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { authClient } from "@web/lib/auth-client";
import i18n from "@web/lib/i18n";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAuthenticated = !!user;
  const [, setRedirectUri] = useState("/");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();
  const currentLanguage = i18n.language;
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "zh-TW", name: "繁體中文", flag: "🇹🇼" },
  ];

  useEffect(() => {
    setRedirectUri(window?.location?.href);
  }, []);
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.invalidate();

      // calling invalidate is supposed recompute the route context, but it doesn't seem to work now.
      // workaround for now is to reload the document
      // https://github.com/TanStack/router/issues/2072
      router.navigate({ to: "/", reloadDocument: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    router.invalidate();
  };

  return (
    <header className="flex px-6 py-4 items-center justify-between bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <Link className="text-2xl font-bold text-red-600" to="/">
        {t("name")}
      </Link>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button
                {...props}
                aria-label="Language"
                size="icon"
                variant="ghost"
              >
                <HugeiconsIcon icon={Globe} size={20} />
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  currentLanguage === lang.code && "bg-gray-100"
                )}
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button
                {...props}
                aria-label={isAuthenticated ? t("nav.userMenu") : "Menu"}
                className="rounded-full"
                size="icon"
                variant="ghost"
              >
                {isAuthenticated && user?.image ? (
                  <Image
                    alt={user.name || "User"}
                    className="size-8 rounded-full object-cover"
                    height={32}
                    src={user.image}
                    width={32}
                  />
                ) : (
                  <HugeiconsIcon icon={Menu01Icon} size={20} />
                )}
              </Button>
            )}
          />
          <DropdownMenuContent align="end" className="w-56">
            {isAuthenticated ? (
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleLogout}
              >
                <HugeiconsIcon icon={Logout01Icon} size={16} />
                <span>{t("nav.logOut")}</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <Link className="flex items-center gap-2" to="/login">
                  <HugeiconsIcon icon={User02Icon} size={16} />
                  <span>{t("nav.logIn")}</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
