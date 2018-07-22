<?php

/**
 * @param Twig_Environment $env - The Twig Environment - https://twig.symfony.com/api/1.x/Twig_Environment.html
 * @param $config - Config of `@basalt/twig-renderer`
 */
function addCustomExtension(\Twig_Environment &$env, $config) {

  /**
   * @example `<h1>Hello {{ customTwigFunctionThatSaysWorld() }}!</h1>` => `<h1>Hello Custom World</h1>`
   */
//  $env->addFunction(new \Twig_SimpleFunction('customTwigFunctionThatSaysWorld', function () {
//    return 'Custom World';
//  }));

  /*
   * Reverse a string
   * @param string $theString
   * @example `<p>{{ reverse('abc') }}</p>` => `<p>cba</p>`
   */
//  $env->addFunction(new \Twig_SimpleFunction('reverse', function ($theString) {
//    return strrev($theString);
//  }));


//  $env->addExtension(new \My\CustomExtension());

//  `{{ foo }}` => `bar`
//  $env->addGlobal('foo', 'bar');

  // example of enabling the Twig debug mode extension (ex. {{ dump(my_variable) }} to check out the template's available data) -- comment out to disable
  $env->addExtension(new \Twig_Extension_Debug());

}
