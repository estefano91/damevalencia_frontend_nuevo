import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getPostBySlug } from "@/lib/blog";

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
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/blog")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isEnglish ? "Back to blog" : "Volver al blog"}
        </Button>

        <article>
          <header className="mb-8">
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
          </header>

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
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
