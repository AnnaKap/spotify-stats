import { Controller, Get, Res, Req, Param } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AppService } from '../app.service';
import axios from 'axios';

@Controller('spotify')
export class SpotifyController {
  private readonly spotifyClientId: string =
    this.appService.getSpotifyClientId();
  private readonly spotifyRedirectURI: string =
    this.appService.getSpotifyRedirectURI();
  private readonly spotifyClientSecret: string =
    this.appService.getSpotifyClientSecret();

  constructor(private readonly appService: AppService) {}

  @Get('check')
  check(): string {
    return 'Spotify Check!';
  }

  @Get('login')
  async loginWithSpotify(@Res() response) {
    // create user session id
    const sessionId = uuidv4();

    // set the session in the response cookie
    response.cookie('session_id', sessionId, {
      httpOnly: true,
      // secure: true --> for prod this should be set so we only use https
    });

    // redirect to the spotify auth endpoint with required params
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${this.spotifyClientId}&response_type=code&redirect_uri=${this.spotifyRedirectURI}`;
    //@todo Anna add state as query param? prevents CSRF
    response.redirect(spotifyAuthUrl);
  }

  // spotify callback
  @Get('authorize')
  async authorizeUser(@Req() request, @Res() response) {
    const sessionId = request?.cookies['session_id'];

    if (!sessionId) {
      response.status(400).send('Session expired or missing');
    }

    const authCode = request.query.code;
    const state = request.query.state;

    console.log('state', state);

    const tokens = await this.exchangeAuthorizationCodeForToken(authCode);

    const jsonTokens = JSON.stringify(tokens);

    let result;
    try {
      result = await this.appService.setRedisData(sessionId, jsonTokens);
    } catch (error) {
      console.error(error);
    }

    if (result === 'OK') {
      response.send('connected');
    } else {
      response.send('not connected');
    }
  }

  async exchangeAuthorizationCodeForToken(authCode: string) {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.spotifyRedirectURI,
        client_id: this.spotifyClientId,
        client_secret: this.spotifyClientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, refresh_token } = tokenResponse.data;

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }

  @Get('/playlist/:id')
  async getPlaylistById(@Param() params: any, @Req() request, @Res() response) {
    const sessionId = request?.cookies['session_id'];

    if (!sessionId) {
      response.status(400).send('Session expired or missing');
      // redirect to login?
    }
    const tokens = await this.appService.getRedisData(sessionId);
    console.log({ tokens, sessionId });
    const { accessToken } = JSON.parse(tokens);
    console.log({ accessToken });
    // response.send('hey');
    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${params.id}?fields=tracks.items(track(name))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log({ playlistResponse });
    return response.send(JSON.stringify(playlistResponse.data));
  }
}
//@todo create spotify service to handle logic of gettin access tokens, and logic to get resources from spotify api
