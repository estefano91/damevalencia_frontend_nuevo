import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { getPostsSortedByDate } from "@/lib/blog";

const Blog = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en" || i18n.language?.startsWith("en");
  const posts = getPostsSortedByDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50/30 to-stone-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100">
            {isEnglish ? "Blog" : "Blog"}
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            {isEnglish
              ? "Stories, news and ideas from DAME and Valencia."
              : "Historias, noticias e ideas de DAME y Valencia."}
          </p>
        </header>

        {posts.length === 0 ? (
          <Card className="border border-stone-200 dark:border-stone-700 bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden">
            <CardContent className="py-16 px-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 mb-4">
                <FileText className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">
                {isEnglish ? "No posts yet" : "Aún no hay entradas"}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                {isEnglish
                  ? "We're preparing content. Come back soon."
                  : "Estamos preparando contenido. Vuelve pronto."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`}>
                  <Card className="border border-stone-200 dark:border-stone-700 bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 sm:p-6">
                      <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 line-clamp-2">
                        {isEnglish && post.title_en ? post.title_en : post.title}
                      </h2>
                      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                        {isEnglish && post.excerpt_en ? post.excerpt_en : post.excerpt}
                      </p>
                      <p className="mt-3 text-xs text-stone-500 dark:text-stone-500">
                        {new Date(post.publishedAt).toLocaleDateString(
                          isEnglish ? "en-GB" : "es-ES",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Blog;
