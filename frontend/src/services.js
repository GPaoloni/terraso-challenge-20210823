const backendUrl = 'http://localhost:8080';

export const startGame = async () => {
  const response = await fetch(`${backendUrl}/startGame`);

  if (response.status !== 200) throw new Error('API error.');

  const respJson = await response.json();
  return respJson;
}

export const makePlay = async () => {
  const response = await fetch(`${backendUrl}/makePlay`);

  if (response.status !== 200) throw new Error('API error.');

  const respJson = await response.json();
  return respJson;
}