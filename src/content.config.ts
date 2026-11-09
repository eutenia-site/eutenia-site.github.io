import { defineCollection, type SchemaContext } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content root. Real data lives in src/content/data and src/config/site.json.
 * EUTENIA_CONTENT=fixtures switches every collection to tests/fixtures/content;
 * any other value is taken as a directory holding all the files (used by tests).
 */
const mode = process.env.EUTENIA_CONTENT;
export const contentRoot = !mode
  ? 'src/content/data'
  : mode === 'fixtures'
    ? 'tests/fixtures/content'
    : mode;
const siteFile = mode ? `${contentRoot}/site.json` : 'src/config/site.json';

export const collectionFiles: Record<string, string> = {
  releases: `${contentRoot}/releases.json`,
  videos: `${contentRoot}/videos.json`,
  shows: `${contentRoot}/shows.json`,
  products: `${contentRoot}/products.json`,
  wallpapers: `${contentRoot}/wallpapers.json`,
  press: `${contentRoot}/press.json`,
  mural: `${contentRoot}/mural.json`,
  fanKit: `${contentRoot}/fan-kit.json`,
  vip: `${contentRoot}/vip.json`,
  stats: `${contentRoot}/stats.json`,
  site: siteFile,
};

const url = z.url();
/** Empty string means "not configured". */
const optionalUrl = z.union([z.literal(''), z.url()]);
const date = z.coerce.date();
/**
 * A show's calendar day, `AAAA-MM-DD` only: a time of day would shift the day the site shows
 * (SHOW-03 compares calendar days in America/Sao_Paulo).
 */
const showDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'O campo "data" do show deve estar no formato AAAA-MM-DD (sem horário).',
  })
  .pipe(z.coerce.date());

export const releaseSchema = ({ image }: SchemaContext) =>
  z.object({
    id: z.string(),
    titulo: z.string().min(1),
    tipo: z.enum(['album', 'ep', 'single', 'ao-vivo']),
    data: date,
    capa: image().optional(),
    faixas: z.array(z.object({ titulo: z.string().min(1), duracaoSeg: z.number().int().min(0) })),
    destaque: z.boolean().optional(),
    letraPrevia: z.string().optional(),
    descricao: z.string().optional(),
    /** Spotify embed URL (album or track) for the compact player. */
    spotifyEmbed: url.optional(),
    links: z.object({
      spotify: url.optional(),
      appleMusic: url.optional(),
      deezer: url.optional(),
      youtubeMusic: url.optional(),
      tidal: url.optional(),
    }),
  });

export const videoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  data: date,
  oficial: z.boolean(),
  destaque: z.boolean().optional(),
  releaseId: z.string().optional(),
});

export const showSchema = z
  .object({
    id: z.string(),
    data: showDay,
    cidade: z.string().min(1),
    uf: z.string().length(2),
    local: z.string().min(1),
    endereco: z.string(),
    tipo: z.enum(['show', 'festival']),
    status: z.enum(['disponivel', 'ultimos', 'esgotado', 'em-breve', 'encerrado']),
    ingressoUrl: optionalUrl.optional(),
    selo: z.string().optional(),
  })
  .superRefine((show, ctx) => {
    if (show.status !== 'encerrado' && !show.endereco.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['endereco'],
        message: 'Informe o endereço do show.',
      });
    }
    if ((show.status === 'disponivel' || show.status === 'ultimos') && !show.ingressoUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['ingressoUrl'],
        message: `Show "${show.id}": ingressoUrl é obrigatório quando o status é "${show.status}".`,
      });
    }
  });

// SPEC_DEVIATION: design.md says "enum 6"; the Loja capture draws five categories plus "Todos".
export const productSchema = z
  .object({
    id: z.string(),
    nome: z.string().min(1),
    categoria: z.enum(['camisetas', 'moletons', 'midia-fisica', 'acessorios', 'edicoes-limitadas']),
    precoCentavos: z.number().int().min(0),
    imagem: z.string().min(1).optional(),
    imagens: z.array(z.string().min(1)).min(1).optional(),
    selo: z.string().optional(),
    tamanhos: z.array(z.string()).optional(),
    especificacao: z.string().optional(),
    /** Product-specific PagSeguro checkout; empty until the payment link is configured. */
    url: optionalUrl.optional(),
    destaque: z.boolean().optional(),
    adicionadoEm: date,
  })
  .refine((product) => Boolean(product.imagem || product.imagens?.length), {
    message: 'Informe uma imagem ou uma lista de imagens do produto.',
    path: ['imagens'],
  })
  .transform((product) => {
    const imagens = [
      ...new Set([...(product.imagem ? [product.imagem] : []), ...(product.imagens ?? [])]),
    ];
    return { ...product, imagem: imagens[0]!, imagens };
  });

const downloadFields = {
  id: z.string(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  tipo: z.string().min(1),
  tamanho: z.string().min(1),
  arquivo: z.string().min(1),
};

export const wallpaperSchema = z.object({
  ...downloadFields,
  categoria: z.enum(['capas', 'ao-vivo', 'logotipos']),
  formato: z.string().min(1),
  resolucao: z.string().min(1),
  imagem: z.string().min(1),
});

export const pressSchema = z
  .object({
    ...downloadFields,
    categoria: z.enum(['apresentacao', 'tecnico', 'divulgacao', 'pacote']),
    arquivo: z.string().default(''),
    tamanho: z.string().default(''),
    disponivel: z.boolean().default(true),
    icone: z.string().min(1),
  })
  .transform((file) => ({ ...file, disponivel: file.disponivel && Boolean(file.arquivo.trim()) }));

export const fanKitSchema = z.object({
  ...downloadFields,
  icone: z.string().min(1),
  selo: z.string().optional(),
});

export const muralSchema = z.object({
  id: z.string(),
  categoria: z.string().min(1),
  texto: z.string().min(1),
  autor: z.string().min(1),
  cidade: z.string().min(1),
  imagem: z.string().optional(),
});

export const vipSchema = z.object({
  id: z.string(),
  selo: z.string().optional(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  beneficios: z.array(z.object({ titulo: z.string().min(1), descricao: z.string().min(1) })),
  valorCentavos: z.number().int().min(0),
  url: url,
  observacao: z.string().optional(),
});

export const statSchema = z.object({
  id: z.string(),
  valor: z.string().min(1),
  rotulo: z.string().min(1),
  ordem: z.number().int().nonnegative().default(0),
});

export const siteSchema = z.object({
  email: z.email(),
  formEndpoint: optionalUrl,
  newsletterEndpoint: optionalUrl,
  votoCidadeEndpoint: optionalUrl,
  lojaUrl: optionalUrl,
  telegramUrl: optionalUrl,
  social: z.object({
    youtube: url,
    spotify: url,
    instagram: url,
    facebook: url,
    x: url,
    tiktok: url,
  }),
});

/** site.json is a single object; the loader exposes it as the entry "site". */
const siteLoader = file(collectionFiles.site, {
  parser: (text) => [{ ...JSON.parse(text), id: 'site' }],
});

// Store the JSON position because persisted collections can be returned in ID order.
const statsLoader = file(collectionFiles.stats, {
  parser: (text) => {
    const stats = JSON.parse(text) as Record<string, unknown>[];
    return stats.map((stat, ordem) => ({ ...stat, ordem }));
  },
});

export const collections = {
  releases: defineCollection({ loader: file(collectionFiles.releases), schema: releaseSchema }),
  videos: defineCollection({ loader: file(collectionFiles.videos), schema: videoSchema }),
  shows: defineCollection({ loader: file(collectionFiles.shows), schema: showSchema }),
  products: defineCollection({ loader: file(collectionFiles.products), schema: productSchema }),
  wallpapers: defineCollection({
    loader: file(collectionFiles.wallpapers),
    schema: wallpaperSchema,
  }),
  press: defineCollection({ loader: file(collectionFiles.press), schema: pressSchema }),
  mural: defineCollection({ loader: file(collectionFiles.mural), schema: muralSchema }),
  fanKit: defineCollection({ loader: file(collectionFiles.fanKit), schema: fanKitSchema }),
  vip: defineCollection({ loader: file(collectionFiles.vip), schema: vipSchema }),
  stats: defineCollection({ loader: statsLoader, schema: statSchema }),
  site: defineCollection({ loader: siteLoader, schema: siteSchema.extend({ id: z.string() }) }),
};
