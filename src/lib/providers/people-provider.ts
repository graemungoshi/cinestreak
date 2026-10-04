import type { MovieSummary, Person, PersonSummary } from "../types";

export interface PersonProvider {
  readonly name: string;
  searchPeople(query: string): Promise<PersonSummary[]>;
  getPerson(id: string): Promise<Person | null>;
  getFilmography(id: string): Promise<MovieSummary[]>;
}
