import { beforeEach, describe, expect, it } from "vitest";
import { devErrorStore, devRecord } from "./dev-store";

beforeEach(() => devErrorStore.clear());

describe("devRecord", () => {
  it("agrupa el mismo error abierto (ignora el query string)", () => {
    devRecord({ source: "server", message: "Boom", path: "/buscar?q=a" });
    devRecord({ source: "server", message: "Boom", path: "/buscar?q=b" });
    const [log] = devErrorStore.list();
    expect(devErrorStore.list()).toHaveLength(1);
    expect(log.occurrences).toBe(2);
  });

  it("un error resuelto que vuelve a pasar abre uno nuevo", () => {
    devRecord({ source: "client", message: "X" });
    devErrorStore.setResolved(devErrorStore.list()[0].id, true);
    devRecord({ source: "client", message: "X" });
    expect(devErrorStore.list().filter((l) => !l.resolved)).toHaveLength(1);
    expect(devErrorStore.list()).toHaveLength(2);
  });

  it("borra solo los resueltos", () => {
    devRecord({ source: "client", message: "A" });
    devRecord({ source: "client", message: "B" });
    devErrorStore.setResolved(devErrorStore.list()[0].id, true);
    devErrorStore.removeResolved();
    expect(devErrorStore.list()).toHaveLength(1);
  });
});
