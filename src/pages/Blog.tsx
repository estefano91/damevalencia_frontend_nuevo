import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, MapPin, Ticket, ChevronRight } from "lucide-react";
import { getPostsSortedByDate } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

const EventMeta = ({
  post,
  isEnglish,
  compact = false,
}: {
  post: BlogPost;
  isEnglish: boolean;
  compact?: boolean;
}) => {
  const e = post.event;
  if (!e) return null;

  const eventDate = isEnglish && e.eventDate_en ? e.eventDate_en : e.eventDate;
  const location = isEnglish && e.location_en ? e.location_en : e.location;
  const price = isEnglish && e.price_en ? e.price_en : e.price;

  const itemClass = compact
    ? "inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400"
    : "flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300";

  const iconClass = compact ? "h-3.5 w-3.5 shrink-0 text-purple-500" : "h-4 w-4 shrink-0 text-purple-500 dark:text-purple-400 mt-0.5";

  return (
    <div className={compact ? "flex flex-wrap items-center gap-x-4 gap-y-1 mt-2" : "space-y-2"}>
      {eventDate && (
        <span className={itemClass}>
          <Calendar className={iconClass} />
          {eventDate}
        </span>
      )}
      {location && (
        <span className={itemClass}>
          <MapPin className={iconClass} />
          <span className={compact ? "truncate max-w-[180px] sm:max-w-none" : undefined}>{location}</span>
        </span>
      )}
      {price && (
        <span className={itemClass}>
          <Ticket className={iconClass} />
          {price}
        </span>
      )}
    </div>
  );
};

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
          <ul className="space-y-5">
            {posts.map((post) => {
              const title = isEnglish && post.title_en ? post.title_en : post.title;
              const excerpt = isEnglish && post.excerpt_en ? post.excerpt_en : post.excerpt;
              return (
                <li key={post.slug}>
                  <Link to={`/blog/${post.slug}`} className="block group">
                    <Card className="border border-stone-200 dark:border-stone-700 bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row">
                        {post.image && (
                          <div className="sm:w-48 md:w-56 shrink-0 h-40 sm:h-auto sm:min-h-[180px] relative bg-stone-100 dark:bg-stone-800">
                            <img
                              src={post.image}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-5 sm:p-6 flex-1 min-w-0 flex flex-col sm:justify-center">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h2 className="text-lg sm:text-xl font-semibold text-stone-800 dark:text-stone-100 line-clamp-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                {title}
                              </h2>
                              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                                {excerpt}
                              </p>
                              <EventMeta post={post} isEnglish={isEnglish} compact />
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {post.tags.slice(0, 4).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-700/80 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:text-stone-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-stone-400 dark:text-stone-500">
                                {isEnglish ? "Published " : "Publicado "}
                                {new Date(post.publishedAt).toLocaleDateString(
                                  isEnglish ? "en-GB" : "es-ES",
                                  { day: "numeric", month: "short", year: "numeric" }
                                )}
                              </span>
                              <ChevronRight className="h-5 w-5 text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Blog;
