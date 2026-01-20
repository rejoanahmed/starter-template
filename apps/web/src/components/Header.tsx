import { Button } from "@starter/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@starter/ui/components/dropdown-menu";
import { cn } from "@starter/ui/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { authClient } from "@web/lib/auth-client";
import i18n from "@web/lib/i18n";
import { Globe, Heart, LogOut, Menu, Search, User } from "lucide-react";
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
    <header className="hidden lg:flex px-6 py-4 items-center justify-between bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <Link className="text-2xl font-bold text-red-600" to="/">
        {t("name")}
      </Link>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button aria-label="Language" size="icon" variant="ghost">
              <Globe size={20} />
            </Button>
          </DropdownMenuTrigger>
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
          <DropdownMenuTrigger>
            <Button
              aria-label={isAuthenticated ? t("header.userMenu") : "Menu"}
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
                <Menu size={20} />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Link className="flex items-center gap-2" to="/">
                <Search size={16} />
                <span>{t("header.explore")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a className="flex items-center gap-2" href="/wishlists">
                <Heart size={16} />
                <span>{t("header.wishlists")}</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link className="flex items-center gap-2" to="/">
                <span>{t("header.listYourSpace")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <a className="flex items-center gap-2" href="/help">
                <span>{t("header.help")}</span>
              </a>
            </DropdownMenuItem>
            {isAuthenticated ? (
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>{t("header.logOut")}</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <Link className="flex items-center gap-2" to="/">
                  <User size={16} />
                  <span>{t("header.logIn")}</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
