import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const covers = [
  'agile-transformation','devsecops','infrastructure-as-code','legacy-modernization',
  'digital-strategy-workshop','generative-ai-enterprise','aws-well-architected','microsoft-copilot',
  'cybersecurity-morocco','business-process-automation','modern-data-platform','azure-vs-aws',
  'ai-consulting-morocco','cloud-migration-checklist'
];
const bucketBase = `${process.env.SUPABASE_URL}/storage/v1/object/public/blog-images/covers`;

const data = JSON.parse(fs.readFileSync('/tmp/blogs.json','utf8'));
const slugify = s => s.replace(/^\/(fr\/)?blog\//,'').replace(/^\//,'');

const rows = data.map((b,i) => {
  const enSlug = slugify(b.en.meta['URL Slug']);
  const frSlug = slugify(b.fr.meta['URL Slug']);
  const tags = (b.en.meta['SEO Title'] || '').replace(/\|.*/,'').trim();
  const words = (b.en.html || '').replace(/<[^>]+>/g,' ').split(/\s+/).length;
  return {
    slug: enSlug,
    slug_fr: frSlug,
    title_en: b.en.title,
    title_fr: b.fr.title,
    excerpt_en: b.en.meta['Meta Description'],
    excerpt_fr: b.fr.meta['Meta Description'],
    content_en: b.en.html,
    content_fr: b.fr.html,
    category: 'Insights',
    cover_image: `${bucketBase}/${covers[i]}.jpg`,
    author: 'Smartways',
    published: true,
    published_at: new Date().toISOString(),
    seo_title_en: b.en.meta['SEO Title']?.replace(/\\/g,'') || b.en.title,
    seo_title_fr: b.fr.meta['SEO Title']?.replace(/\\/g,'') || b.fr.title,
    seo_description_en: b.en.meta['Meta Description'],
    seo_description_fr: b.fr.meta['Meta Description'],
    h1_en: b.en.title,
    h1_fr: b.fr.title,
    reading_time_minutes: Math.max(3, Math.round(words/220)),
    structured_data_type: 'Article',
  };
});

console.log('rows:', rows.length);
const { data: res, error } = await supa.from('blog_posts').insert(rows).select('slug,slug_fr');
if (error) { console.error(error); process.exit(1); }
console.log('inserted:', res.length);
res.forEach(r => console.log(' -', r.slug, '|', r.slug_fr));
