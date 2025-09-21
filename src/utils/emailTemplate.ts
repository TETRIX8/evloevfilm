export const getEmailTemplate = (to_name: string, from_name: string, message: string) => {
  return `
    Цитата ${to_name},

    Новой сообщение от ${from_name}:

    ${message}

    EvloevFilm 
    Create by Tetrixuno
    A-K project
  `;
};