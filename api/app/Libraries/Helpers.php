<?php

class Helpers
{
    /**
     * Generates a random string of the given length consisting of digits and
     * lowercase letters
     * 
     * @param int $length The length of the string to generate
     * @return string The random string
     */
    public static function generateRandomString(int $length): string {
        $keyspace = '0123456789abcdefghijklmnopqrstuvwxyz';
        $pieces = [];
        $max = mb_strlen($keyspace, '8bit') - 1;
        for ($i = 0; $i < $length; ++$i) {
            $pieces []= $keyspace[random_int(0, $max)];
        }
        return implode('', $pieces);
    }
}
