import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Calendar, MapPin, Ticket } from "lucide-react";
import { getPostBySlug } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

const EventInfoCard = ({ post, isEnglish }: { post: BlogPost; isEnglish: boolean }) => {
  const e = post.event;
  if (!e) return null;

  const eventDate = isEnglish && e.eventDate_en ? e.eventDate_en : e.eventDate;
  const location = isEnglish && e.location_en ? e.location_en : e.location;
  const price = isEnglish && e.price_en ? e.price_en : e.price;

  return (
    <Card className="border border-purple-200 dark:border-purple-800/60 bg-gradient-to-br from-purple-50/80 to-white dark:from-purple-950/30 dark:to-gray-800/90 rounded-2xl overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-4">
          {isEnglish ? "Event details" : "Información del evento"}
        </h3>
        <dl className="space-y-4">
          {eventDate && (
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 shrink-0 text-purple-500 dark:text-purple-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                  {isEnglish ? "Date" : "Fecha"}
                </dt>
                <dd className="mt-0.5 text-stone-800 dark:text-stone-100 font-medium">{eventDate}</dd>
              </div>
            </div>
          )}
          {location && (
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-purple-500 dark:text-purple-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                  {isEnglish ? "Location" : "Lugar"}
                </dt>
                <dd className="mt-0.5 text-stone-800 dark:text-stone-100 font-medium">{location}</dd>
              </div>
            </div>
          )}
          {price && (
            <div className="flex gap-3">
              <Ticket className="h-5 w-5 shrink-0 text-purple-500 dark:text-purple-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                  {isEnglish ? "Admission" : "Entrada"}
                </dt>
                <dd className="mt-0.5 text-stone-800 dark:text-stone-100 font-medium">{price}</dd>
              </div>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en" || i18n.language?.startsWith("en");

  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50/30 to-stone-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate("/blog")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEnglish ? "Back to blog" : "Volver al blog"}
          </Button>
          <p className="text-stone-600 dark:text-stone-400">
            {isEnglish ? "Post not found." : "Entrada no encontrada."}
          </p>
        </div>
      </div>
    );
  }

  const title = isEnglish && post.title_en ? post.title_en : post.title;
  const content = isEnglish && post.content_en ? post.content_en : post.content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50/30 to-stone-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/blog")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isEnglish ? "Back to blog" : "Volver al blog"}
        </Button>

        <article className="flex flex-col lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1">
            <header className="mb-6">
              <time className="text-sm text-stone-500 dark:text-stone-400">
                {new Date(post.publishedAt).toLocaleDateString(
                  isEnglish ? "en-GB" : "es-ES",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </time>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100">
                {title}
              </h1>
              {post.author && (
                <p className="mt-2 text-stone-600 dark:text-stone-400">{post.author}</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-stone-200/80 dark:bg-stone-600/50 px-3 py-1 text-xs font-medium text-stone-700 dark:text-stone-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {post.image && (
              <figure className="mb-6 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 aspect-[16/10] sm:aspect-[2/1]">
                <img
                  src={post.image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </figure>
            )}

            {post.event && (
              <div className="mb-6 lg:hidden">
                <EventInfoCard post={post} isEnglish={isEnglish} />
              </div>
            )}

            <Card className="border border-stone-200 dark:border-stone-700 bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 prose prose-stone dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-stone-700 dark:text-stone-300 leading-relaxed">
                  {content}
                </div>
              </CardContent>
            </Card>

            {post.sourceUrl && (
              <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">
                {isEnglish ? "Source: " : "Fuente: "}
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {post.sourceLabel || "Valencia Secreta"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </p>
            )}
          </div>

          {post.event && (
            <aside className="mt-8 lg:mt-0 lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-6">
                <EventInfoCard post={post} isEnglish={isEnglish} />
              </div>
            </aside>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
