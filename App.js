import { WEATHER_API_KEY } from '@env';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import * as Font from 'expo-font';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const [city, setCity] = useState('로딩중...');
  const [days, setDays] = useState([]);
  const [permission, setPermission] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const icons = {
    Clouds: 'cloudy',
    Clear: 'day-sunny',
    Atmosphere: 'cloudy-gusts',
    Snow: 'snow',
    Rain: 'rains',
    Drizzle: 'rain',
    Thunderstorm: 'lightning',
  };

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setPermission(false);
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync();
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
    setCity(location[0].city);

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`);
    const json = await response.json();

    setDays(
      json.list.filter((weather) => {
        if (weather.dt_txt.includes('00:00:00')) {
          return weather;
        }
      }),
    );
  };

  const splitDate = (date) => {
    const [year, month, days] = date.split('-');

    return `${year}년 ${month}월 ${days}일`;
  };

  const loadFonts = async () => {
    await Font.loadAsync({
      bmjua: require('./assets/fonts/BMJUA.ttf'),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
    getWeather();
  }, []);

  if(!fontsLoaded){
    return null;
  }

  return (
    <LinearGradient colors={['#a6c0fe', '#f68084']} style={styles.container}>
      <View style={styles.city}>
        <StyledText style={styles.cityName}>{city}</StyledText>
      </View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.weather}>
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: 'center' }}>
            <ActivityIndicator color='white' size='large' />
          </View>
        ) : (
          days.map((day, idx) => (
            <View key={idx} style={styles.day}>
              <StyledText style={styles.date}>{splitDate(day.dt_txt.split(' ')[0])}</StyledText>
              <View style={styles.temp_icon}>
                <StyledText style={styles.temp}>{parseFloat(day.main.temp).toFixed(1)}</StyledText>
                <Fontisto style={{ marginRight: 20 }} name={icons[day.weather[0].main]} size={70} color='white' />
              </View>
              <StyledText style={styles.main}>{day.weather[0].main}</StyledText>
              <StyledText style={styles.description}>{day.weather[0].description}</StyledText>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const StyledText = styled.Text`
  font-family: 'bmjua';
  color: white;
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  date: {
    fontSize: 20,
    fontWeight: '700',
  },

  city: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cityName: {
    fontSize: 60,
  },

  weather: {},

  day: {
    width: SCREEN_WIDTH,
    alignItems: 'left',
    padding: 10,
  },

  temp: {
    marginTop: 30,
    fontSize: 120,
    fontWeight: '400',
    marginBottom: 20,
  },

  main: {
    fontSize: 40,
    marginTop: -10,
  },

  description: {
    fontSize: 30,
  },

  temp_icon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});
