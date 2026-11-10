const rules: Array<{ pattern: RegExp; methods: string[] }> = [
  { pattern: /^api\/jugadores$/, methods: ["GET", "POST"] },
  { pattern: /^api\/jugadores\/\d+$/, methods: ["GET", "PUT", "DELETE"] },
  { pattern: /^api\/matchdays$/, methods: ["GET", "POST"] },
  { pattern: /^api\/matchdays\/\d+$/, methods: ["DELETE"] },
  { pattern: /^api\/matchdays\/\d+\/marcador$/, methods: ["PUT"] },
  { pattern: /^api\/matchdays\/\d+\/jugadores$/, methods: ["PUT"] },
  {
    pattern: /^api\/reportes\/(partidos-por-mes|ausentes-por-mes)$/,
    methods: ["GET"],
  },
];

export function isAllowedBackendRequest(path: string, method: string) {
  return rules.some(
    (rule) => rule.pattern.test(path) && rule.methods.includes(method.toUpperCase()),
  );
}

